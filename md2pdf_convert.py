#!/usr/bin/env python3
"""
Simple PDF generator from Markdown with custom styling
Uses WeasyPrint directly for better control
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

DEFAULT_CSS = """
@page {
    size: A4;
    margin: 2cm;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

body {
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
}

h1 {
    font-size: 24pt;
    font-weight: 700;
    color: #1a1a1a;
    border-bottom: 2px solid #0066cc;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

h2 {
    font-size: 18pt;
    font-weight: 600;
    color: #333;
    margin-top: 30px;
    margin-bottom: 15px;
}

h3 {
    font-size: 14pt;
    font-weight: 600;
    color: #555;
    margin-top: 20px;
    margin-bottom: 10px;
}

p {
    margin-bottom: 12px;
    text-align: justify;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 10pt;
}

th {
    background-color: #0066cc;
    color: white;
    padding: 10px;
    text-align: left;
    font-weight: 600;
}

td {
    padding: 8px 10px;
    border-bottom: 1px solid #ddd;
}

tr:nth-child(even) {
    background-color: #f5f5f5;
}

code {
    font-family: "Courier New", monospace;
    background-color: #f0f0f0;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 10pt;
}

pre {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 10pt;
}

blockquote {
    border-left: 4px solid #0066cc;
    margin: 15px 0;
    padding: 10px 15px;
    background-color: #f9f9f9;
    font-style: italic;
}

ul, ol {
    margin-left: 20px;
    margin-bottom: 12px;
}

li {
    margin-bottom: 5px;
}

a {
    color: #0066cc;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
"""

CORPORATE_CSS = """
@page {
    size: A4;
    margin: 2cm;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

body {
    font-size: 11pt;
    line-height: 1.6;
    color: #2c3e50;
}

h1 {
    font-size: 26pt;
    font-weight: 700;
    color: #2c3e50;
    border-bottom: 3px solid #3498db;
    padding-bottom: 12px;
    margin-bottom: 25px;
}

h2 {
    font-size: 18pt;
    font-weight: 600;
    color: #2c3e50;
    margin-top: 35px;
    margin-bottom: 15px;
}

h3 {
    font-size: 14pt;
    font-weight: 600;
    color: #34495e;
    margin-top: 20px;
    margin-bottom: 10px;
}

p {
    margin-bottom: 12px;
    text-align: justify;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 10pt;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

th {
    background-color: #3498db;
    color: white;
    padding: 12px;
    text-align: left;
    font-weight: 600;
}

td {
    padding: 10px 12px;
    border-bottom: 1px solid #ecf0f1;
}

tr:nth-child(even) {
    background-color: #f8f9fa;
}

tr:hover {
    background-color: #e8f4f8;
}

code {
    font-family: "Courier New", monospace;
    background-color: #ecf0f1;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10pt;
    color: #e74c3c;
}

pre {
    background-color: #2c3e50;
    color: #ecf0f1;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 10pt;
    border-left: 4px solid #3498db;
}

blockquote {
    border-left: 4px solid #3498db;
    margin: 15px 0;
    padding: 12px 18px;
    background-color: #ebf5fb;
    font-style: italic;
    border-radius: 0 5px 5px 0;
}

ul, ol {
    margin-left: 20px;
    margin-bottom: 12px;
}

li {
    margin-bottom: 5px;
}

a {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
}

a:hover {
    text-decoration: underline;
}
"""

JDM_CSS = """
@page {
    size: A4;
    margin: 2cm;
    font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

body {
    font-size: 11pt;
    line-height: 1.6;
    color: #1A1A2E;
    background-color: #F8F9FA;
}

h1 {
    font-size: 26pt;
    font-weight: 700;
    color: #0D0D0D;
    border-bottom: 4px solid #E63946;
    padding-bottom: 12px;
    margin-bottom: 25px;
    background: linear-gradient(90deg, #0D0D0D 0%, #1A1A2E 100%);
    color: white;
    padding: 15px 20px;
    margin-left: -20px;
    margin-right: -20px;
}

h2 {
    font-size: 18pt;
    font-weight: 700;
    color: #E63946;
    margin-top: 35px;
    margin-bottom: 15px;
    border-left: 4px solid #00D4FF;
    padding-left: 15px;
}

h3 {
    font-size: 14pt;
    font-weight: 600;
    color: #1A1A2E;
    margin-top: 20px;
    margin-bottom: 10px;
}

p {
    margin-bottom: 12px;
    text-align: justify;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 10pt;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
}

th {
    background-color: #E63946;
    color: white;
    padding: 12px;
    text-align: left;
    font-weight: 600;
}

td {
    padding: 10px 12px;
    border-bottom: 1px solid #E0E0E0;
}

tr:nth-child(even) {
    background-color: #F8F9FA;
}

tr:hover {
    background-color: #FFF5F5;
}

code {
    font-family: "JetBrains Mono", "Courier New", monospace;
    background-color: #1A1A2E;
    color: #00D4FF;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10pt;
}

pre {
    background-color: #0D0D0D;
    color: #F8F9FA;
    padding: 15px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 10pt;
    border-left: 4px solid #E63946;
}

blockquote {
    border-left: 4px solid #FFB800;
    margin: 15px 0;
    padding: 12px 18px;
    background-color: #FFF8E1;
    font-style: italic;
    border-radius: 0 8px 8px 0;
    color: #1A1A2E;
}

ul, ol {
    margin-left: 20px;
    margin-bottom: 12px;
}

li {
    margin-bottom: 5px;
}

li::marker {
    color: #E63946;
}

a {
    color: #00D4FF;
    text-decoration: none;
    font-weight: 500;
}

a:hover {
    text-decoration: underline;
}

strong {
    color: #E63946;
}
"""

def convert_md_to_pdf(input_file, output_file=None, style="corporate"):
    """Convert Markdown file to PDF with styling"""
    
    # Read markdown
    with open(input_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Convert to HTML
    html_content = markdown2.markdown(markdown_content, extras=['tables', 'fenced-code-blocks', 'footnotes'])
    
    # Wrap in full HTML document
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Report</title>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Select CSS
    if style == "corporate":
        css = CORPORATE_CSS
    elif style == "jdm":
        css = JDM_CSS
    else:
        css = DEFAULT_CSS
    
    # Generate PDF
    html = HTML(string=full_html)
    
    if output_file is None:
        output_file = str(Path(input_file).with_suffix('.pdf'))
    
    html.write_pdf(output_file, stylesheets=[CSS(string=css)])
    print(f"PDF created: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: md2pdf_convert.py <input.md> [output.pdf] [style]")
        print("Styles: default, corporate, jdm")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    style = sys.argv[3] if len(sys.argv) > 3 else "corporate"
    
    convert_md_to_pdf(input_file, output_file, style)