import os
import base64
import re

SITE_DIR = "/Users/guilhermerossi/Documents/Casa de Video/Site"

def get_base64_src(file_path, mime_type):
    if not os.path.exists(file_path):
        print(f"Warning: File not found: {file_path}")
        return ""
    with open(file_path, "rb") as f:
        data = f.read()
    b64 = base64.b64encode(data).decode('utf-8')
    return f"data:{mime_type};base64,{b64}"

print("Processing assets...")

# 1. Base64 encode logo.png
logo_b64 = get_base64_src(os.path.join(SITE_DIR, "Documentos/logo.png"), "image/png")
print(f"Logo Base64 size: {len(logo_b64)} chars")

# 2. Base64 encode gallery images
galeria_b64 = {}
galeria_dir = os.path.join(SITE_DIR, "Galeria")
for fname in sorted(os.listdir(galeria_dir)):
    if fname.startswith('.'):
        continue
    fpath = os.path.join(galeria_dir, fname)
    ext = os.path.splitext(fname)[1].lower().replace('.', '')
    mime = "image/avif" if ext == "avif" else f"image/{ext}"
    galeria_b64[fname] = get_base64_src(fpath, mime)
    print(f"Galeria/{fname} Base64 size: {len(galeria_b64[fname])} chars")

# 3. Read CSS & JS
with open(os.path.join(SITE_DIR, "css/style.css"), "r", encoding="utf-8") as f:
    css_content = f.read()

with open(os.path.join(SITE_DIR, "js/main.js"), "r", encoding="utf-8") as f:
    js_content = f.read()

# Read main index.html
with open(os.path.join(SITE_DIR, "index.html"), "r", encoding="utf-8") as f:
    html_content = f.read()

# Replace CSS link with inline <style>
css_inline = f"<style>\n{css_content}\n</style>"
html_content = re.sub(r'<link\s+href="css/style\.css"\s+rel="stylesheet"\s+type="text/css"\s*/>', css_inline, html_content)

# Replace JS script tag with inline <script>
js_inline = f"<script>\n{js_content}\n</script>"
html_content = re.sub(r'<script\s+src="js/main\.js"\s+defer\s*></script>', js_inline, html_content)

# Replace logo.png references
html_content = html_content.replace("Documentos/logo.png", logo_b64)

# Replace Galeria/X.avif references
for fname, b64_str in galeria_b64.items():
    html_content = html_content.replace(f"Galeria/{fname}", b64_str)

# Read subpages to extract their body contents for inline modal popups
def extract_subpage_body(filename):
    fpath = os.path.join(SITE_DIR, filename)
    if not os.path.exists(fpath):
        return ""
    with open(fpath, "r", encoding="utf-8") as f:
        sub_html = f.read()
    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', sub_html, re.DOTALL | re.IGNORECASE)
    if body_match:
        content = body_match.group(1)
    else:
        content = sub_html
    # Replace logo and images in subpage content
    content = content.replace("Documentos/logo.png", logo_b64)
    # Remove navigation bar back links or turn them into modal close triggers
    content = content.replace('href="index.html"', 'href="javascript:void(0)" onclick="closeModal()"')
    return content

carta_body = extract_subpage_body("carta-compromisso.html")
politica_body = extract_subpage_body("politica-trabalhista.html")

# Read subpage CSS styles if needed
def extract_subpage_style(filename):
    fpath = os.path.join(SITE_DIR, filename)
    if not os.path.exists(fpath):
        return ""
    with open(fpath, "r", encoding="utf-8") as f:
        sub_html = f.read()
    style_match = re.search(r'<style[^>]*>(.*?)</style>', sub_html, re.DOTALL | re.IGNORECASE)
    return style_match.group(1) if style_match else ""

carta_style = extract_subpage_style("carta-compromisso.html")
politica_style = extract_subpage_style("politica-trabalhista.html")

# Add modal CSS & JS + Subpage overlays into html_content
modals_code = f"""
<!-- Subpages Inline Modal System -->
<style>
{carta_style}
{politica_style}
.cdv-standalone-modal {{
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #0e0e0e;
  overflow-y: auto;
  display: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}}
.cdv-standalone-modal.active {{
  display: block;
  opacity: 1;
}}
.cdv-modal-close-btn {{
  position: fixed;
  top: 24px;
  right: 32px;
  z-index: 100000;
  background: rgba(245, 197, 0, 0.9);
  color: #0e0e0e;
  border: none;
  padding: 10px 20px;
  font-family: monospace;
  font-weight: bold;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  transition: transform 0.2s, background 0.2s;
}}
.cdv-modal-close-btn:hover {{
  background: #ffffff;
  transform: scale(1.05);
}}
</style>

<div id="modal-carta-compromisso" class="cdv-standalone-modal">
  <button class="cdv-modal-close-btn" onclick="closeModal('modal-carta-compromisso')">✕ Fechar Documento</button>
  {carta_body}
</div>

<div id="modal-politica-trabalhista" class="cdv-standalone-modal">
  <button class="cdv-modal-close-btn" onclick="closeModal('modal-politica-trabalhista')">✕ Fechar Documento</button>
  {politica_body}
</div>

<script>
function openModal(id) {{
  var el = document.getElementById(id);
  if(el) {{
    el.classList.add('active');
    document.body.style.overflow = 'hidden';
  }}
}}
function closeModal(id) {{
  if(id) {{
    var el = document.getElementById(id);
    if(el) el.classList.remove('active');
  }} else {{
    var modals = document.querySelectorAll('.cdv-standalone-modal');
    modals.forEach(m => m.classList.remove('active'));
  }}
  document.body.style.overflow = '';
}}

document.addEventListener("DOMContentLoaded", function() {{
  document.querySelectorAll('a[href="carta-compromisso.html"], #link-carta').forEach(function(link) {{
    link.addEventListener('click', function(e) {{
      e.preventDefault();
      openModal('modal-carta-compromisso');
    }});
  }});
  document.querySelectorAll('a[href="politica-trabalhista.html"], #link-politica').forEach(function(link) {{
    link.addEventListener('click', function(e) {{
      e.preventDefault();
      openModal('modal-politica-trabalhista');
    }});
  }});
}});
</script>
"""

# Insert modal code before </body>
html_content = html_content.replace("</body>", f"{modals_code}\n</body>")

# Save standalone HTML file
standalone_html_path = os.path.join(SITE_DIR, "site_completo_standalone.html")
with open(standalone_html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

html_size_mb = os.path.getsize(standalone_html_path) / (1024 * 1024)
print(f"Generated standalone HTML file: {standalone_html_path} ({html_size_mb:.2f} MB)")

# Save Base64 text file
b64_full = base64.b64encode(html_content.encode('utf-8')).decode('utf-8')
data_uri = f"data:text/html;charset=utf-8;base64,{b64_full}"

b64_txt_path = os.path.join(SITE_DIR, "site_base64.txt")
with open(b64_txt_path, "w", encoding="utf-8") as f:
    f.write(data_uri)

txt_size_mb = os.path.getsize(b64_txt_path) / (1024 * 1024)
print(f"Generated Base64 text file: {b64_txt_path} ({txt_size_mb:.2f} MB)")
