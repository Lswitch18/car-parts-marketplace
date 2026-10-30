#!/usr/bin/env python3
"""DAIG Marketplace — Ambiente de Trabalho Contínuo de Agentes Autônomos (24/7 Daemon).

Mantém uma esquadra de agentes autônomos trabalhando continuamente em background:
1. [Watcher Agent]         Monitora hash SHA-256 de código-fonte (src/, android/, ios/, configs)
2. [Android Guardian Crew] Audita e auto-corrige Android (SDK 35, Gradle, Manifest, Colors, OAuth, Assets)
3. [iOS Apple Team Crew]   Audita e sincroniza iOS (Info.plist, Podfile, i18n, Bundle nativo)
4. [Mobile Design Crew]    Garante padrão Apple HIG, GSAP 120fps, Safe-Area e Valuation 100/100
5. [TypeScript & Sync Bot] Valida tipagem estática (`tsc -b`) e sincroniza bundles Capacitor

Telemetria contínua gravada em:
  - logs/autonomous_agents_status.json
  - logs/autonomous_guardian.log
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOGS_DIR = ROOT / "logs"
STATUS_FILE = LOGS_DIR / "autonomous_agents_status.json"
LOG_FILE = LOGS_DIR / "autonomous_guardian.log"

WATCH_DIRS = [
    ROOT / "src",
    ROOT / "android" / "app" / "src" / "main",
    ROOT / "ios" / "App" / "App",
    ROOT / ".github" / "workflows",
]
WATCH_FILES = [
    ROOT / "capacitor.config.ts",
    ROOT / "package.json",
    ROOT / "android" / "build.gradle",
    ROOT / "android" / "variables.gradle",
    ROOT / "android" / "app" / "build.gradle",
    ROOT / "android" / "app" / "capacitor.build.gradle",
]
IGNORE_PARTS = {"node_modules", ".git", "dist", "build", "__pycache__", "public"}


def log_event(message: str, level: str = "INFO") -> None:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] [{level}] {message}"
    print(line, flush=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def compute_workspace_fingerprint() -> tuple[str, int]:
    hasher = hashlib.sha256()
    count = 0

    for wf in WATCH_FILES:
        if wf.exists():
            try:
                hasher.update(str(wf.relative_to(ROOT)).encode())
                hasher.update(wf.read_bytes())
                count += 1
            except OSError:
                pass

    for wdir in WATCH_DIRS:
        if not wdir.exists():
            continue
        for root, dirs, files in os.walk(wdir):
            dirs[:] = [d for d in sorted(dirs) if d not in IGNORE_PARTS and not d.startswith(".")]
            for fname in sorted(files):
                if fname.startswith("."):
                    continue
                fpath = Path(root) / fname
                try:
                    rel = str(fpath.relative_to(ROOT))
                    hasher.update(rel.encode())
                    hasher.update(fpath.read_bytes())
                    count += 1
                except OSError:
                    pass

    return hasher.hexdigest(), count


def run_agent_step(name: str, cmd: list[str]) -> dict:
    start = time.time()
    proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    duration = round(time.time() - start, 2)
    passed = proc.returncode == 0
    return {
        "agent": name,
        "status": "GREEN" if passed else "RED",
        "exit_code": proc.returncode,
        "duration_sec": duration,
        "last_run": datetime.now(timezone.utc).astimezone().isoformat(),
        "output_tail": (proc.stdout + "\n" + proc.stderr).strip().splitlines()[-12:],
    }


def execute_full_cycle(cycle_num: int, trigger_reason: str) -> dict:
    log_event(f"Iniciando Ciclo #{cycle_num} (Motivo: {trigger_reason})...", "CYCLE")

    # 1. Android Team Crew com Auto-Healing (--fix)
    android_res = run_agent_step(
        "android-google-team-crew",
        [sys.executable, str(ROOT / "scripts" / "android_team_crew.py"), "--fix"],
    )
    log_event(
        f"[android-google-team-crew] -> {android_res['status']} ({android_res['duration_sec']}s)",
        "OK" if android_res["status"] == "GREEN" else "HEAL",
    )

    # 2. iOS Apple Team Crew
    ios_res = run_agent_step(
        "ios-apple-team-crew",
        [sys.executable, str(ROOT / "scripts" / "ios_apple_team_crew.py"), "--check-only"],
    )
    if ios_res["status"] != "GREEN":
        log_event("[ios-apple-team-crew] Detectada falha de sincronismo — acionando Auto-Heal...", "HEAL")
        subprocess.run(["npm", "run", "build:store"], cwd=ROOT, capture_output=True, text=True)
        subprocess.run(["npx", "cap", "copy", "ios"], cwd=ROOT, capture_output=True, text=True)
        subprocess.run(["npx", "cap", "copy", "android"], cwd=ROOT, capture_output=True, text=True)
        ios_res = run_agent_step(
            "ios-apple-team-crew",
            [sys.executable, str(ROOT / "scripts" / "ios_apple_team_crew.py"), "--check-only"],
        )
    log_event(
        f"[ios-apple-team-crew] -> {ios_res['status']} ({ios_res['duration_sec']}s)",
        "OK" if ios_res["status"] == "GREEN" else "ERROR",
    )

    # 3. Mobile Design & Valuation Crew
    design_res = run_agent_step(
        "mobile-phone-design-crew",
        [sys.executable, str(ROOT / "scripts" / "mobile_phone_design_crew.py"), "--audit"],
    )
    log_event(
        f"[mobile-phone-design-crew] -> {design_res['status']} ({design_res['duration_sec']}s)",
        "OK" if design_res["status"] == "GREEN" else "WARN",
    )

    # 4. TypeScript Static Analysis Agent
    ts_res = run_agent_step(
        "typescript-static-guardian",
        ["npm", "run", "typecheck"],
    )
    log_event(
        f"[typescript-static-guardian] -> {ts_res['status']} ({ts_res['duration_sec']}s)",
        "OK" if ts_res["status"] == "GREEN" else "ERROR",
    )

    agents = [android_res, ios_res, design_res, ts_res]
    all_green = all(a["status"] == "GREEN" for a in agents)

    fingerprint, file_count = compute_workspace_fingerprint()
    report = {
        "orchestrator": "DAIG Autonomous Guardian Daemon",
        "mode": "24/7 Continuous Self-Healing",
        "pid": os.getpid(),
        "cycle": cycle_num,
        "trigger": trigger_reason,
        "overall_status": "ALL_GREEN" if all_green else "DEGRADED",
        "monitored_files": file_count,
        "workspace_sha256": fingerprint,
        "updated_at": datetime.now(timezone.utc).astimezone().isoformat(),
        "agents": agents,
    }

    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    STATUS_FILE.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    log_event(
        f"Ciclo #{cycle_num} concluído: overall_status={report['overall_status']} (arquivos monitorados: {file_count})",
        "SUMMARY",
    )
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="DAIG Autonomous Guardian Daemon")
    parser.add_argument("--once", action="store_true", help="Executa um ciclo completo de auditoria e auto-healing e encerra")
    parser.add_argument("--interval", type=int, default=15, help="Intervalo em segundos para polling de arquivos (default: 15s)")
    parser.add_argument("--heartbeat", type=int, default=120, help="Intervalo máximo em segundos entre auditorias completas mesmo sem mudança (default: 120s)")
    args = parser.parse_args()

    log_event("🚀 Inicializando Ambiente de Trabalho de Agentes Autônomos (DAIG Guardian Daemon)...", "BOOT")

    cycle = 1
    report = execute_full_cycle(cycle, "boot_initial_scan")
    if args.once:
        return 0 if report["overall_status"] == "ALL_GREEN" else 1

    last_fp = report["workspace_sha256"]
    last_full_run = time.time()

    try:
        while True:
            time.sleep(max(3, args.interval))
            current_fp, _ = compute_workspace_fingerprint()
            now = time.time()

            if current_fp != last_fp:
                cycle += 1
                report = execute_full_cycle(cycle, "file_modification_detected")
                last_fp = report["workspace_sha256"]
                last_full_run = time.time()
            elif (now - last_full_run) >= args.heartbeat:
                cycle += 1
                report = execute_full_cycle(cycle, "periodic_heartbeat_verification")
                last_fp = report["workspace_sha256"]
                last_full_run = time.time()
    except KeyboardInterrupt:
        log_event("Daemon encerrado via KeyboardInterrupt.", "SHUTDOWN")
        return 0


if __name__ == "__main__":
    sys.exit(main())

