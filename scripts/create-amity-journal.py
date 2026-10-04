"""Create the edited Amity journal from reviewed source notes and real photo crops.

The original scan is a local input, never copied into the public site.
Run with the bundled Python runtime; source renders live in outputs/amity-source.
"""
from pathlib import Path
import json, shutil, html
from PIL import Image as PILImage, ImageDraw
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
import pypdfium2 as pdfium
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'docs/amity-journal.json').read_text(encoding='utf-8'))
PUBLIC = ROOT / 'assets/evidence/amity-journal'
PUBLIC.mkdir(parents=True, exist_ok=True)
OUT = ROOT / 'output/pdf/amity-observation-reflective-journal.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
QA = ROOT / 'outputs/amity-journal-review'
QA.mkdir(parents=True, exist_ok=True)
for name, filename in [('Body', 'segoeui.ttf'), ('BodyBold', 'segoeuib.ttf'), ('Serif', 'georgia.ttf'), ('SerifBold', 'georgiab.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts') / filename)))

for name, photo in DATA['photos'].items():
    scan = PILImage.open(ROOT / f"outputs/amity-source/page-{photo['page']:02}.jpg")
    cropped = scan.crop(photo['box'])
    cropped.save(PUBLIC / f'{name}.webp', quality=88)

W, H = A4
LEFT, RIGHT, TOP, BOTTOM = 48, W - 48, H - 89, 62
WIDTH = RIGHT - LEFT
INK, MUTED, COPPER, PAPER, LINE = map(HexColor, ['#17313d', '#506069', '#945d34', '#fbf8f0', '#ddcfb8'])
styles = {
    'body': ParagraphStyle('body', fontName='Body', fontSize=10.4, leading=16, textColor=INK, spaceAfter=9),
    'caption': ParagraphStyle('caption', fontName='Body', fontSize=8.1, leading=11, textColor=MUTED),
    'section': ParagraphStyle('section', fontName='BodyBold', fontSize=11.4, leading=15, textColor=COPPER),
    'quote': ParagraphStyle('quote', fontName='Serif', fontSize=15, leading=23, textColor=INK),
}
c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
c.setTitle(DATA['title'] + ' - Amity International School, Mayur Vihar')
c.setAuthor(DATA['author'])
c.setSubject('Four-day observation, 1-4 December; edited from the supplied handwritten journal')

def para(text, y, style='body', x=LEFT, width=WIDTH):
    p = Paragraph(html.escape(text), styles[style])
    _, height = p.wrap(width, H)
    if y - height < BOTTOM:
        raise ValueError(f'Page {c.getPageNumber()} text overflows: {text[:50]}')
    p.drawOn(c, x, y - height)
    return y - height - (9 if style == 'body' else 6)

def label(text, x, y, size=8, color=COPPER):
    c.setFillColor(color); c.setFont('BodyBold', size); c.drawString(x, y, text)

def base(chapter, title, source):
    c.setFillColor(PAPER); c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(LINE); c.setLineWidth(.7); c.line(LEFT, H-51, RIGHT, H-51)
    label('KRISHNA MAHATO / SCHOOL OBSERVATION', LEFT, H-38, 7.5, MUTED)
    label(chapter.upper(), LEFT, TOP, 8)
    title_p = Paragraph(html.escape(title), ParagraphStyle('title', fontName='SerifBold', fontSize=25, leading=31, textColor=INK))
    _, th = title_p.wrap(WIDTH, H); title_p.drawOn(c, LEFT, TOP-18-th)
    c.setStrokeColor(LINE); c.line(LEFT, 48, RIGHT, 48)
    c.setFont('Body', 7.2); c.setFillColor(MUTED); c.drawString(LEFT, 34, source)
    c.drawRightString(RIGHT, 34, f'{c.getPageNumber():02}')
    c.bookmarkPage(f'page-{c.getPageNumber()}')
    c.addOutlineEntry(title, f'page-{c.getPageNumber()}', level=0, closed=False)
    return TOP - 18 - th - 23

def photos(names, y, max_height=175):
    gap = 16; col = (WIDTH-gap*(len(names)-1))/len(names)
    heights = []
    for i, name in enumerate(names):
        photo = DATA['photos'][name]; path = PUBLIC / f'{name}.webp'
        im = PILImage.open(path); iw, ih = im.size
        dw = min(col, max_height*iw/ih); dh = dw*ih/iw
        x = LEFT + i*(col+gap)
        c.drawImage(ImageReader(im), x, y-dh, width=dw, height=dh)
        caption = photo['caption'] + f" / Source p. {photo['page']}"
        cap = Paragraph(html.escape(caption), styles['caption']); _, ch = cap.wrap(col, H)
        if y-dh-8-ch < BOTTOM: raise ValueError('Photo overflow')
        cap.drawOn(c, x, y-dh-8-ch); heights.append(dh+8+ch)
    return y - max(heights) - 18

# Cover: an editorial student journal, with a real campus photograph.
c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(INK); c.rect(0,H-327,W,327,fill=1,stroke=0)
label('B.Ed. / FIELD OBSERVATION', LEFT,H-55,9,HexColor('#ddbd88'))
for text, y in [('School Observation',H-122),('Reflective Journal',H-164)]:
    c.setFont('SerifBold',32); c.setFillColor(PAPER); c.drawString(LEFT,y,text)
c.setFont('Body',12); c.drawString(LEFT,H-207,'Amity International School, Mayur Vihar')
c.setFont('BodyBold',11); c.drawString(LEFT,H-245,'1-4 December  /  Four-day observation')
im=PILImage.open(PUBLIC/'campus.webp')
c.drawImage(ImageReader(im),LEFT,220,width=WIDTH,height=WIDTH*im.height/im.width)
label('KRISHNA MAHATO',LEFT,164,13,INK)
c.setFont('Serif',15); c.setFillColor(INK); c.drawString(LEFT,136,'Daily notes, photographs and reflections')
c.setStrokeColor(LINE); c.line(LEFT,92,RIGHT,92)
c.setFont('Body',8.5); c.setFillColor(MUTED); c.drawString(LEFT,72,'Edited edition of the supplied handwritten journal')
c.bookmarkPage('cover');c.addOutlineEntry('Cover','cover',level=0);c.showPage()

for page in DATA['pages']:
    y=base(page['chapter'],page['title'],page['source'])
    for section in page['sections']:
        y=para(section['title'],y,'section')
        for text in section.get('text',[]): y=para(text,y)
        for text in section.get('bullets',[]):
            label('-',LEFT,y-10,10,INK)
            y=para(text,y,x=LEFT+13,width=WIDTH-13)
        y-=6
    if page.get('contents'):
        y=para('Contents',y,'section')
        for title, number in [('Purpose and school setting',3),('Day 1 / Arrival, lessons and preparation',4),('Day 2 / Explanations, reading and practical work',6),('Day 3 / Activities and learning spaces',8),('Day 4 / Counselling, assembly and school tour',10),('Reflection / Teaching and school life',13),('Self-reflection / Classroom and wider responsibilities',15),('Conclusion and source record',17)]:
            y=para(title,y,'caption',width=WIDTH-30)
            c.setFont('BodyBold',8.2);c.setFillColor(COPPER);c.drawRightString(RIGHT,y+6,str(number));y-=3
    if page.get('photos'):
        available=y-BOTTOM-35
        y=photos(page['photos'],y,min(190,available))
    if page.get('callout'):
        y-=15;c.setStrokeColor(COPPER);c.setLineWidth(2);c.line(LEFT,y,LEFT,y-72)
        y=para(page['callout'],y,'quote',x=LEFT+18,width=WIDTH-18)
    if page.get('photoIndex'):
        y=para('Photograph sources',y,'section')
        used={'campus',*(name for page in DATA['pages'] for name in page.get('photos',[]))}
        y=para('; '.join(f"{p['caption']} (p. {p['page']})" for name,p in DATA['photos'].items() if name in used)+'.',y,'caption')
    c.showPage()
c.save()
reader=PdfReader(OUT)
assert len(reader.pages)==17, len(reader.pages)
text='\n'.join(p.extract_text() for p in reader.pages)
for required in ['1-4 December','Kinship, Caste and Class','Roll the Dice','Cambridge English','Ms. Sushmita','Source and editorial record']:
    assert required in text, required
assert len(text.split())>2800
shutil.copyfile(OUT,ROOT/'assets/evidence/amity-observation-reflective-journal.pdf')
pdf=pdfium.PdfDocument(str(OUT))
renders=[]
for i,page in enumerate(pdf):
    render=page.render(scale=1.5).to_pil().convert('RGB')
    render.save(QA/f'page-{i+1:02}.png')
    if i==0: render.save(ROOT/'assets/evidence/amity-observation-reflective-journal.webp',quality=88)
    renders.append(render)
for start in range(0,len(renders),6):
    sheet=PILImage.new('RGB',(900,1320),'#e1ded4');draw=ImageDraw.Draw(sheet)
    for j,render in enumerate(renders[start:start+6]):
        thumb=render.copy();thumb.thumbnail((426,585))
        x=12+(j%2)*450;y=26+(j//2)*440
        thumb.thumbnail((426,410));sheet.paste(thumb,(x,y))
        draw.text((x,y-16),f'Page {start+j+1}',fill='black')
    sheet.save(QA/f'contact-{start+1:02}.jpg',quality=90)
(QA/'verification.json').write_text(json.dumps({'pages':len(reader.pages),'words':len(text.split()),'photos':len(DATA['photos']),'bytes':OUT.stat().st_size},indent=2))
print(f'Created {OUT}: {len(reader.pages)} pages, {len(text.split())} words, {OUT.stat().st_size} bytes')
