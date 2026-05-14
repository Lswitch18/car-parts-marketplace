#!/usr/bin/env python3
"""
Clean Professional PDF Generator
"""

import sys
import os
from pathlib import Path

try:
    from weasyprint import HTML, CSS
    import markdown2
except ImportError:
    print("Installing dependencies...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown2", "weasyprint"])
    from weasyprint import HTML, CSS
    import markdown2

CLEAN_PROFESSIONAL_CSS = """
@page {
    size: A4;
    margin: 2.5cm top 2cm bottom;
    font-family: "Inter", "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
    @bottom-center {
        content: "JAPANCAR PARTS — " counter(page) " / " counter(pages);
        font-size: 9pt;
        color: #888;
    }
    @top-left {
        content: "JAPANCAR PARTS";
        font-size: 10pt;
        font-weight: 600;
        color: #333;
    }
    @top-right {
        content: "Plano de Lançamento";
        font-size: 10pt;
        color: #666;
    }
}

* {
    box-sizing: border-box;
}

body {
    font-size: 10pt;
    line-height: 1.65;
    color: #222;
    background-color: white;
}

h1 {
    font-size: 22pt;
    font-weight: 700;
    color: #111;
    margin: 0 0 8px 0;
    padding: 0 0 15px 0;
    border-bottom: 1px solid #ddd;
    page-break-after: avoid;
}

h1.title-main {
    font-size: 28pt;
    font-weight: 300;
    color: #1a1a1a;
    border: none;
    padding: 30px 0 10px 0;
    margin-bottom: 30px;
    text-align: center;
    letter-spacing: 1px;
}

h1.title-main::after {
    content: "";
    display: block;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #333 0%, #666 100%);
    margin: 15px auto 0;
}

h2 {
    font-size: 14pt;
    font-weight: 600;
    color: #1a1a1a;
    margin: 35px 0 12px 0;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    page-break-after: avoid;
}

h3 {
    font-size: 11pt;
    font-weight: 600;
    color: #333;
    margin: 25px 0 8px 0;
    page-break-after: avoid;
}

p {
    margin: 0 0 10px 0;
    text-align: justify;
}

ul, ol {
    margin: 8px 0 12px 0;
    padding-left: 25px;
}

li {
    margin-bottom: 6px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 9pt;
}

th {
    background-color: #f5f5f5;
    color: #333;
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #ccc;
}

td {
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    color: #444;
}

tr:nth-child(even) {
    background-color: #fafafa;
}

tr:hover {
    background-color: #f0f0f0;
}

code {
    font-family: "SF Mono", "Consolas", "Monaco", monospace;
    font-size: 8.5pt;
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    color: #333;
}

pre {
    background-color: #f8f8f8;
    border: 1px solid #e0e0e0;
    padding: 12px 15px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 8.5pt;
    line-height: 1.5;
    margin: 12px 0;
}

pre code {
    background: none;
    padding: 0;
}

blockquote {
    margin: 15px 0;
    padding: 10px 20px;
    border-left: 3px solid #ccc;
    background-color: #f9f9f9;
    font-style: normal;
    color: #555;
}

hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 25px 0;
}

a {
    color: #0066cc;
    text-decoration: none;
}

strong {
    font-weight: 600;
    color: #111;
}

.caption {
    font-size: 8.5pt;
    color: #777;
    text-align: center;
    margin-top: 5px;
}

.toc {
    background-color: #f8f8f8;
    padding: 20px;
    margin: 20px 0;
    border-radius: 4px;
}

.toc h2 {
    margin-top: 0;
    font-size: 12pt;
}

.toc ul {
    list-style: none;
    padding: 0;
}

.toc li {
    padding: 4px 0;
}

.checklist-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 6px 0;
}

.checklist-item::before {
    content: "☐";
    font-size: 12pt;
}
"""

def convert_md_to_pdf(input_file, output_file=None, style="clean"):
    """Convert Markdown file to clean professional PDF"""
    
    with open(input_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    html_content = markdown2.markdown(markdown_content, extras=['tables', 'fenced-code-blocks', 'footnotes'])
    
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>JAPANCAR PARTS — Plano de Lançamento</title>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    if style == "clean":
        css = CLEAN_PROFESSIONAL_CSS
    else:
        css = CLEAN_PROFESSIONAL_CSS
    
    html = HTML(string=full_html)
    
    if output_file is None:
        output_file = str(Path(input_file).with_suffix('.pdf'))
    
    html.write_pdf(output_file, stylesheets=[CSS(string=css)])
    print(f"✅ PDF created: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: clean_pdf.py <input.md> [output.pdf]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    convert_md_to_pdf(input_file, output_file, "clean")