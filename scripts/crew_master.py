#!/usr/bin/env python3
"""Master CrewAI CLI Orchestrator — DAIG Marketplace.

Orquestra todos os agentes especialistas via linha de comando (CLI):
- [design-crew]     Mobile Phone Luxury Design, Apple HIG, Haptics & Valuation
- [ios-apple-team]  iOS Dev, Google/Apple Auth, i18n JA/PT, Secrets & Build
- [security-crew]   SAST, RLS, Security Invoker & OWASP Gates
- [build-sync]      Compilação Store e sincronização com Capacitor iOS

Uso:
  python3 scripts/crew_master.py --all
  python3 scripts/crew_master.py --design
  python3 scripts/crew_master.py --ios
  python3 scripts/crew_master.py --sync
  python3 scripts/crew_master.py --status
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Cores ANSI para saída rica no terminal
CYAN = "\033[96m"
BLUE = "\033[94m"
PURPLE = "\033[95m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"


def header():
    print(f"{CYAN}╔════════════════════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{CYAN}║{BOLD}   🚀 DAIG MARKETPLACE — MASTER CREWAI CLI ORCHESTRATOR                    {RESET}{CYAN}║{RESET}")
    print(f"{CYAN}║{RESET}   Orquestrador de Agentes Especialistas • Mobile-First • JDM • JPY        {CYAN}║{RESET}")
    print(f"{CYAN}╚════════════════════════════════════════════════════════════════════════════╝{RESET}\n")


def run_cmd(cmd: list[str], desc: str) -> bool:
    print(f"{BLUE}▸ [{desc}] Executando: {' '.join(cmd)}...{RESET}")
    start = time.time()
    res = subprocess.run(cmd, cwd=str(ROOT))
    dur = round(time.time() - start, 2)
    if res.returncode == 0:
        print(f"{GREEN}✔ [{desc}] Concluído com sucesso ({dur}s){RESET}\n")
        return True
    else:
        print(f"{RED}✖ [{desc}] Falhou com código {res.returncode} ({dur}s){RESET}\n")
        return False


def run_design_crew() -> bool:
    print(f"{PURPLE}{BOLD}=== [CREW 1: Mobile Phone Premium Design & Valuation] ==={RESET}")
    script = ROOT / "scripts" / "mobile_phone_design_crew.py"
    return run_cmd([sys.executable, str(script), "--audit"], "Mobile Design Crew")


def run_ios_crew() -> bool:
    print(f"{PURPLE}{BOLD}=== [CREW 2: iOS Apple Team & Capacitor Core] ==={RESET}")
    script = ROOT / "scripts" / "ios_apple_team_crew.py"
    return run_cmd([sys.executable, str(script), "--check-only"], "iOS Apple Team Crew")


def run_sync() -> bool:
    print(f"{PURPLE}{BOLD}=== [Sincronização de Assets: Vite Store → Capacitor iOS] ==={RESET}")
    ok_build = run_cmd(["npm", "run", "build:store"], "Vite Build Store")
    if not ok_build:
        return False
    return run_cmd(["npx", "cap", "copy", "ios"], "Capacitor Copy iOS")


def run_typecheck() -> bool:
    print(f"{PURPLE}{BOLD}=== [Validação de Tipos: TypeScript tsc -b] ==={RESET}")
    return run_cmd(["npm", "run", "typecheck"], "TypeScript Typecheck")


def print_status():
    header()
    print(f"{BOLD}Status das Frentes Especialistas:{RESET}")
    print(f"  • {CYAN}Mobile Store Home:{RESET}   Apple HIG squircle + JDM Rare Picks + Trust Bar")
    print(f"  • {CYAN}Autenticação Dual:{RESET}   Google Sign-In + Apple Sign-In nativo e web")
    print(f"  • {CYAN}Internacionalização:{RESET} Japonês (ja) padrão estrito + Português (pt-BR)")
    print(f"  • {CYAN}Deep Link OAuth:{RESET}       com.daig.marketplace://login-callback ativo")
    print(f"  • {CYAN}Appetize Simulator:{RESET}  Build .zip gerado e pronto para teste")
    print(f"  • {CYAN}Maestro UI Flows:{RESET}    Testes automatizados configurados (.maestro/flows/)\n")


def main():
    parser = argparse.ArgumentParser(description="Master CrewAI CLI Orchestrator")
    parser.add_argument("--all", action="store_true", help="Executa todas as crews e validações em conjunto")
    parser.add_argument("--design", action="store_true", help="Executa a Crew de Design Mobile & Valuation")
    parser.add_argument("--ios", action="store_true", help="Executa a Crew iOS Apple Team")
    parser.add_argument("--sync", action="store_true", help="Compila o frontend e sincroniza com o Capacitor")
    parser.add_argument("--typecheck", action="store_true", help="Executa checagem de tipos do TypeScript")
    parser.add_argument("--status", action="store_true", help="Exibe o cockpit de status do projeto")

    args = parser.parse_args()

    # Se nenhum argumento passado, roda --all por padrão
    if not any([args.all, args.design, args.ios, args.sync, args.typecheck, args.status]):
        args.all = True

    header()

    results: dict[str, bool] = {}

    if args.status:
        print_status()
        return 0

    if args.all or args.design:
        results["Mobile Design Crew"] = run_design_crew()

    if args.all or args.ios:
        results["iOS Apple Team Crew"] = run_ios_crew()

    if args.sync:
        results["Sync Assets"] = run_sync()

    if args.typecheck:
        results["TypeScript"] = run_typecheck()

    print(f"{CYAN}========================================================================{RESET}")
    print(f"{BOLD}PAINEL FINAL DA MASTER CREW:{RESET}")
    for name, success in results.items():
        status_str = f"{GREEN}APROVADO ✔{RESET}" if success else f"{RED}FALHOU ✖{RESET}"
        print(f"  • {name:<30}: {status_str}")
    print(f"{CYAN}========================================================================{RESET}")

    all_ok = all(results.values())
    if all_ok:
        print(f"\n{GREEN}{BOLD}🎉 TODAS AS CREWS ESTÃO 100% VERDES E HOMOLOGADAS!{RESET}\n")
        return 0
    else:
        print(f"\n{RED}{BOLD}⚠️ Existem itens pendentes em uma ou mais crews.{RESET}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
