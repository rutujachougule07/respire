import fitz
import os

pdf_files = ['A Mahabal Group Venture.pdf', 'Respire Fitness Quotation.pdf']

for pdf_name in pdf_files:
    if not os.path.exists(pdf_name):
        continue
    print(f"=================== {pdf_name} ===================")
    doc = fitz.open(pdf_name)
    print(f"Total pages: {len(doc)}")
    for i, page in enumerate(doc):
        print(f"\n--- Page {i+1} Text ---")
        text = page.get_text()
        print(text[:1500])
        images = page.get_images()
        print(f"Images count: {len(images)}")
        for j, img in enumerate(images):
            xref = img[0]
            base_img = doc.extract_image(xref)
            img_bytes = base_img["image"]
            img_ext = base_img["ext"]
            prefix = pdf_name.split()[0]
            img_filename = f"extracted_{prefix}_p{i+1}_img{j+1}.{img_ext}"
            with open(img_filename, "wb") as f:
                f.write(img_bytes)
            print(f"Extracted image: {img_filename} ({len(img_bytes)} bytes)")
