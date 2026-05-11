from PIL import Image
import os

def process_image():
    path = r"c:\성원파크골프컨설팅\images\logo_wide.png"
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    img = Image.open(path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Luma calculation
        luma = item[0] * 0.299 + item[1] * 0.587 + item[2] * 0.114
        
        # The background is dark leather, the text is gold.
        # Let's map luma to alpha. Darker pixels get lower alpha.
        if luma < 40:
            newData.append((item[0], item[1], item[2], 0))
        elif luma < 120:
            # Smooth transition for anti-aliasing
            alpha = int((luma - 40) * (255 / 80))
            newData.append((item[0], item[1], item[2], min(255, max(0, alpha))))
        else:
            newData.append((item[0], item[1], item[2], 255))

    img.putdata(newData)
    img.save(r"c:\성원파크골프컨설팅\images\logo_transparent.png", "PNG")
    print("Saved logo_transparent.png")

process_image()
