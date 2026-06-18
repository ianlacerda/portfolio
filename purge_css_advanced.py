import os
import re

PORTFOLIO_DIR = r"C:\Users\ian\portfolio"
HTML_FILES = ["index.html", "ux-report.html", "infinity-art.html"]
JS_DIR = os.path.join(PORTFOLIO_DIR, "js")

STYLE_ORIG = os.path.join(PORTFOLIO_DIR, "css", "style.original.css")
STYLE_OUT = os.path.join(PORTFOLIO_DIR, "css", "style.css")

CASE_ORIG = os.path.join(PORTFOLIO_DIR, "css", "case-study.original.css")
CASE_OUT = os.path.join(PORTFOLIO_DIR, "css", "case-study.css")

# A whitelist of classes we definitely do NOT want to purge under any circumstance
WHITELIST_CLASSES = {
    "js-enabled", "pf-mod-js", "pf-mod-touch", 
    "revealed", "reveal-element", "is-revealed",
    "home-content-hidden", "home-content-visible",
    "section-bg-light", "section-bg-dark"
}

ALWAYS_KEEP_TAGS = {
    'html', 'body', 'div', 'span', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'img', 'svg', 'path', 'circle', 'line', 'polyline', 'defs', 'lineargradient', 'stop', 'text',
    'iframe', 'audio', 'video', 'source', 'button', 'input', 'textarea', 'label', 'ul', 'ol', 'li'
}

ALL_HTML_TAGS = {
    'html', 'body', 'div', 'span', 'applet', 'object', 'iframe', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
    'p', 'blockquote', 'pre', 'a', 'abbr', 'acronym', 'address', 'big', 'cite', 'code', 'del', 'dfn', 
    'em', 'img', 'ins', 'kbd', 'q', 's', 'samp', 'small', 'strike', 'strong', 'sub', 'sup', 'tt', 'var', 
    'b', 'u', 'i', 'center', 'dl', 'dt', 'dd', 'ol', 'ul', 'li', 'fieldset', 'form', 'label', 'legend', 
    'table', 'caption', 'tbody', 'tfoot', 'thead', 'tr', 'th', 'td', 'article', 'aside', 'canvas', 
    'details', 'embed', 'figure', 'figcaption', 'footer', 'header', 'hgroup', 'menu', 'nav', 'output', 
    'ruby', 'section', 'summary', 'time', 'mark', 'audio', 'video', 'input', 'button', 'select', 
    'textarea', 'optgroup', 'option', 'hr', 'main', 'svg', 'path', 'circle', 'line', 'polyline',
    'defs', 'lineargradient', 'stop', 'text'
}

def is_class_whitelisted(cls):
    cls_lower = cls.lower()
    # 1. Exact matches in whitelist
    if cls in WHITELIST_CLASSES:
        return True
    # 2. Starts with w- (Webflow boilerplate/state)
    if cls_lower.startswith('w-') or cls_lower.startswith('w--'):
        return True
    # 3. Lightbox classes (both w-lightbox and pf-lightbox)
    if cls_lower.startswith('pf-lightbox') or cls_lower.startswith('w-lightbox'):
        return True
    # 4. Dynamic states
    if cls_lower in {'pf-open', 'pf-active', 'pf-current'}:
        return True
    # 5. Generic open/active state suffixes
    if cls_lower.endswith('-open') or cls_lower.endswith('-active'):
        return True
    return False

def split_selectors(selector_str):
    parts = []
    current = []
    in_comment = False
    i = 0
    while i < len(selector_str):
        if not in_comment and selector_str[i:i+2] == '/*':
            in_comment = True
            current.append('/*')
            i += 2
            continue
        elif in_comment and selector_str[i:i+2] == '*/':
            in_comment = False
            current.append('*/')
            i += 2
            continue
        
        c = selector_str[i]
        if c == ',' and not in_comment:
            parts.append("".join(current).strip())
            current = []
        else:
            current.append(c)
        i += 1
    if current:
        parts.append("".join(current).strip())
    return parts

def get_used_classes():
    used = set(WHITELIST_CLASSES)
    
    # 1. Scan HTML files for class="..." or class='...'
    for filename in HTML_FILES:
        path = os.path.join(PORTFOLIO_DIR, filename)
        if not os.path.exists(path):
            continue
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
            
        class_groups = re.findall(r'class=["\'](.*?)["\']', html)
        for group in class_groups:
            for cls in group.split():
                cls = cls.strip()
                if cls:
                    used.add(cls)
                    
    # 2. Scan JS files for class names as literal strings or words
    if os.path.exists(JS_DIR):
        for js_file in os.listdir(JS_DIR):
            if js_file.endswith(".js"):
                path = os.path.join(JS_DIR, js_file)
                with open(path, "r", encoding="utf-8") as f:
                    js_code = f.read()
                # Find all single/double quoted strings in JS
                strings = re.findall(r'["\']([a-zA-Z0-9_-]+)["\']', js_code)
                for s in strings:
                    used.add(s)
                # Also find any word matching class-like names
                words = re.findall(r'\b([a-zA-Z0-9_-]+)\b', js_code)
                for w in words:
                    used.add(w)
                    
    print(f"Detected {len(used)} unique used classes from HTML and JS.")
    return used

def get_used_tags():
    used_tags = set(ALWAYS_KEEP_TAGS)
    for filename in HTML_FILES:
        path = os.path.join(PORTFOLIO_DIR, filename)
        if not os.path.exists(path):
            continue
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
        found = re.findall(r'<([a-zA-Z0-9:-]+)', html)
        for t in found:
            if not t.startswith('!'):
                used_tags.add(t.lower())
    print(f"Detected {len(used_tags)} unique used HTML tags: {sorted(list(used_tags))}")
    return used_tags

def check_selector_tag_usage(selector_text, used_tags):
    # Remove attributes, e.g. [type="button"]
    sel = re.sub(r'\[.*?\]', ' ', selector_text)
    # Remove class names, e.g. .class-name
    sel = re.sub(r'\.[a-zA-Z0-9_-]+', ' ', sel)
    # Remove IDs, e.g. #id-name
    sel = re.sub(r'#[a-zA-Z0-9_-]+', ' ', sel)
    # Remove pseudo-classes and pseudo-elements, e.g. :hover, ::before
    sel = re.sub(r':[a-zA-Z0-9_-]+', ' ', sel)
    
    # Extract remaining tag tokens
    words = re.findall(r'\b([a-zA-Z0-9-]+)\b', sel)
    for word in words:
        word_lower = word.lower()
        if word_lower in ALL_HTML_TAGS and word_lower not in used_tags:
            return False
    return True

def parse_css(content):
    blocks = []
    i = 0
    in_comment = False
    in_string = False
    string_char = None
    bracket_count = 0
    current_block_start = 0
    
    while i < len(content):
        # Handle comments
        if not in_string and not in_comment and content[i:i+2] == '/*':
            in_comment = True
            i += 2
            continue
        elif in_comment and content[i:i+2] == '*/':
            in_comment = False
            i += 2
            continue
        if in_comment:
            i += 1
            continue
            
        # Handle strings
        c = content[i]
        if not in_comment:
            if in_string:
                if c == string_char and content[i-1] != '\\':
                    in_string = False
            else:
                if c in ("'", '"'):
                    in_string = True
                    string_char = c
                    
        # Handle braces
        if not in_comment and not in_string:
            if c == '{':
                bracket_count += 1
            elif c == '}':
                bracket_count -= 1
                if bracket_count == 0:
                    block_text = content[current_block_start:i+1]
                    blocks.append(block_text)
                    current_block_start = i + 1
        i += 1
        
    if current_block_start < len(content):
        remaining = content[current_block_start:].strip()
        if remaining:
            blocks.append(remaining)
            
    return blocks

def process_block(block_text, used_classes, used_tags):
    block_text = block_text.strip()
    if not block_text:
        return ""
        
    first_brace = block_text.find('{')
    if first_brace == -1:
        return block_text
        
    selector = block_text[:first_brace].strip()
    body = block_text[first_brace:].strip()
    
    if selector.startswith('@media'):
        inner_content = body[1:-1].strip()
        inner_blocks = parse_css(inner_content)
        processed_inner = []
        for ib in inner_blocks:
            p_ib = process_block(ib, used_classes, used_tags)
            if p_ib:
                processed_inner.append(p_ib)
                
        if not processed_inner:
            return ""
            
        joined_inner = "\n  ".join(processed_inner)
        return f"{selector} {{\n  {joined_inner}\n}}"
        
    if (selector.startswith('@keyframes') or 
        selector.startswith('@-webkit-keyframes') or 
        selector.startswith('@font-face') or 
        selector.startswith('@import') or 
        selector.startswith('@charset')):
        return block_text
        
    # Split using the custom comment-and-comma-safe split function
    selectors = split_selectors(selector)
    kept_selectors = []
    
    for sel in selectors:
        # Clean comments from the selector line before checking usage
        sel_clean = re.sub(r'/\*.*?\*/', '', sel, flags=re.DOTALL).strip()
        if not sel_clean:
            continue
            
        classes_in_sel = re.findall(r'\.([a-zA-Z0-9_-]+)', sel_clean)
        is_used = True
        for cls in classes_in_sel:
            if cls not in used_classes and not is_class_whitelisted(cls):
                is_used = False
                break
                
        if is_used:
            # Check tag usage on the cleaned selector line
            if not check_selector_tag_usage(sel_clean, used_tags):
                is_used = False
                
        if is_used:
            kept_selectors.append(sel)
            
    if not kept_selectors:
        return ""
        
    new_selector = ", ".join(kept_selectors)
    return f"{new_selector} {body}"

def minify_content(css_text):
    minified = re.sub(r'/\*.*?\*/', '', css_text, flags=re.DOTALL)
    minified = re.sub(r'\s+', ' ', minified)
    symbols = ['{', '}', ':', ';', ',', '>', '+', '~']
    for s in symbols:
        minified = minified.replace(f' {s}', s).replace(f'{s} ', s)
    minified = minified.replace(';}', '}')
    return minified.strip()

def purge_file(in_path, out_path, used_classes, used_tags):
    if not os.path.exists(in_path):
        print(f"File not found: {in_path}")
        return
        
    with open(in_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    orig_size = len(content)
    blocks = parse_css(content)
    
    processed_blocks = []
    for b in blocks:
        p_b = process_block(b, used_classes, used_tags)
        if p_b:
            processed_blocks.append(p_b)
            
    purged_content = "\n\n".join(processed_blocks)
    
    with open(in_path, "w", encoding="utf-8") as f:
        f.write(purged_content)
        
    min_content = minify_content(purged_content)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(min_content)
        
    purged_size = len(purged_content)
    min_size = len(min_content)
    
    print(f"\nPurged: {os.path.basename(in_path)}")
    print(f"  Original size: {orig_size/1024:.1f} KB")
    print(f"  Purged original size: {purged_size/1024:.1f} KB")
    print(f"  Minified size: {min_size/1024:.1f} KB")
    print(f"  Saved: {(orig_size - min_size)/1024:.1f} KB ({((orig_size - min_size)/orig_size)*100:.1f}%)")

def main():
    used_classes = get_used_classes()
    used_tags = get_used_tags()
    
    print("\n--- Purging style.original.css ---")
    purge_file(STYLE_ORIG, STYLE_OUT, used_classes, used_tags)
    
    print("\n--- Purging case-study.original.css ---")
    purge_file(CASE_ORIG, CASE_OUT, used_classes, used_tags)

if __name__ == "__main__":
    main()
