import os
import markdown
import weasyprint
from PIL import Image

DIAG_DIR = "/home/lswitch/car-parts-marketplce/docs/diag"

CSS_STYLE = """
@page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
    @bottom-right {
        content: "Página " counter(page) " de " counter(pages);
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 9pt;
        color: #64748b;
    }
    @bottom-left {
        content: "Digital AIGarage (DAIG) - Documentação";
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 9pt;
        color: #94a3b8;
    }
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1e293b;
    margin: 0;
    padding: 0;
}

h1 {
    font-size: 20pt;
    color: #0f172a;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 8px;
    margin-top: 0;
    margin-bottom: 20px;
}

h2 {
    font-size: 15pt;
    color: #1e3a8a;
    margin-top: 24px;
    margin-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
}

h3 {
    font-size: 12pt;
    color: #1e293b;
    margin-top: 18px;
    margin-bottom: 8px;
}

hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 20px 0;
}

p {
    margin-top: 0;
    margin-bottom: 12px;
}

ul, ol {
    margin-top: 0;
    margin-bottom: 12px;
    padding-left: 24px;
}

li {
    margin-bottom: 4px;
}

code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 9.5pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 14px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.45;
}

pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
    border: none;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    margin-bottom: 20px;
    font-size: 10pt;
}

th {
    background-color: #1e293b;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 8px 12px;
    border: 1px solid #1e293b;
}

td {
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
}

tr:nth-child(even) {
    background-color: #f8fafc;
}

blockquote {
    border-left: 4px solid #2563eb;
    background-color: #eff6ff;
    margin: 16px 0;
    padding: 10px 16px;
    color: #1e40af;
    border-radius: 0 4px 4px 0;
}

img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 16px auto;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
"""

def convert_md_to_pdf(md_path, pdf_path):
    print(f"Converting MD: {os.path.basename(md_path)} -> {os.path.basename(pdf_path)}")
    with open(md_path, "r", encoding="utf-8") as f:
        text = f.read()

    html_content = markdown.markdown(
        text,
        extensions=["tables", "fenced_code", "toc", "attr_list", "def_list"]
    )

    full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{os.path.basename(md_path)}</title>
    <style>{CSS_STYLE}</style>
</head>
<body>
    {html_content}
</body>
</html>
"""

    weasyprint.HTML(string=full_html, base_url=DIAG_DIR).write_pdf(pdf_path)

def convert_png_to_pdf(png_path, pdf_path):
    print(f"Converting PNG: {os.path.basename(png_path)} -> {os.path.basename(pdf_path)}")
    img = Image.open(png_path)
    if img.mode != "RGB":
        img = img.convert("RGB")
    img.save(pdf_path, "PDF", resolution=300.0)

def main():
    files = sorted(os.listdir(DIAG_DIR))
    converted_files = []
    
    for filename in files:
        filepath = os.path.join(DIAG_DIR, filename)
        
        # Skip sheets (.xlsx, .xls, .csv) as requested
        if filename.endswith((".xlsx", ".xls", ".csv")):
            print(f"Skipping sheet: {filename}")
            continue
            
        if filename.endswith(".md"):
            pdf_filename = filename[:-3] + ".pdf"
            pdf_path = os.path.join(DIAG_DIR, pdf_filename)
            convert_md_to_pdf(filepath, pdf_path)
            converted_files.append((filename, pdf_filename))
        elif filename.endswith(".png"):
            pdf_filename = filename[:-4] + ".pdf"
            pdf_path = os.path.join(DIAG_DIR, pdf_filename)
            convert_png_to_pdf(filepath, pdf_path)
            converted_files.append((filename, pdf_filename))
        else:
            print(f"Ignoring non-target file: {filename}")

    print("\nConversion finished successfully!")
    for src, dst in converted_files:
        print(f" - {src} -> {dst}")

if __name__ == "__main__":
    main()
