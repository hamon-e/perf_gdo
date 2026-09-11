"""Generation of the printable route topo.

The layout deliberately mirrors the paper topo used at the climbing wall: each
route is located by its lane and grade, while the colour of the cell identifies
the holds.  Everything is drawn as vectors so the exported document stays sharp
on an A4 printout.
"""

from io import BytesIO
from typing import Iterable

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas


SECTORS = (
    ("Plexi + toit", 1, 3),
    ("Vérin gauche", 4, 8),
    ("Dévers", 9, 19),
    ("Vérin droit", 20, 22),
    ("Dalle", 23, 27),
    ("9 m", 28, 31),
)

# Values follow the numeric representation already used by the application.
GRADE_ROWS = (
    (4.25, "4a"), (4.35, "4a+"), (4.5, "4b"), (4.6, "4b+"), (4.75, "4c"), (4.85, "4c+"),
    (5.25, "5a"), (5.35, "5a+"), (5.5, "5b"), (5.6, "5b+"), (5.75, "5c"), (5.85, "5c+"),
    (6.25, "6a"), (6.35, "6a+"), (6.5, "6b"), (6.6, "6b+"), (6.75, "6c"), (6.85, "6c+"),
    (7.25, "7a"), (7.35, "7a+"), (7.5, "7b"), (7.6, "7b+"), (7.75, "7c"), (7.85, "7c+"),
    (8.25, "8a"), (8.35, "8a+"), (8.5, "8b"), (8.6, "8b+"), (8.75, "8c"), (8.85, "8c+"),
    (9.25, "9a"), (9.35, "9a+"),
)


def grade_label(value: float) -> str:
    """Return the display grade, accepting old values saved with a 0.05 step."""
    closest_value, label = min(GRADE_ROWS, key=lambda row: abs(row[0] - value))
    if abs(closest_value - value) <= 0.11:
        return label
    return f"{value:g}"


def _colour(value: str):
    try:
        return colors.HexColor(value)
    except (TypeError, ValueError):
        return colors.HexColor("#8a8f98")


def _is_light(colour) -> bool:
    return (colour.red * 0.2126) + (colour.green * 0.7152) + (colour.blue * 0.0722) > 0.84


def _routes_by_cell(routes: Iterable):
    cells = {}
    for route in routes:
        lane = int(route.couloir_id)
        if not 1 <= lane <= 31:
            continue
        label = grade_label(float(route.difficulty))
        cells.setdefault((lane, label), []).append(route)
    return cells


def build_topo_pdf(routes: Iterable, version_date) -> bytes:
    """Build a single-page landscape A4 topo for the selected wall version."""
    output = BytesIO()
    pdf = canvas.Canvas(output, pagesize=landscape(A4), pageCompression=1)
    page_width, page_height = landscape(A4)
    pdf.setTitle("Topo des voies")
    pdf.setAuthor("GDO - Carnet de grimpe")
    pdf.setSubject("Topo de cotations imprimable")

    margin_x = 26
    grid_left = margin_x + 34
    grid_right = page_width - margin_x
    grid_width = grid_right - grid_left
    column_width = grid_width / 31
    top = page_height - 70
    header_height = 30
    row_height = 12.2
    grid_bottom = top - header_height - (len(GRADE_ROWS) * row_height)
    cells = _routes_by_cell(routes)

    pdf.setFillColor(colors.HexColor("#18251f"))
    pdf.setFont("Helvetica-Bold", 17)
    pdf.drawCentredString(page_width / 2, page_height - 31, "TOPO - COTATIONS DES VOIES")
    pdf.setFillColor(colors.HexColor("#46564d"))
    pdf.setFont("Helvetica", 8.5)
    formatted_date = version_date.strftime("%d/%m/%Y") if version_date else "-"
    pdf.drawCentredString(page_width / 2, page_height - 45, f"Version du mur : {formatted_date}")

    # Sector names and lane numbers.
    pdf.setStrokeColor(colors.HexColor("#18251f"))
    pdf.setLineWidth(0.8)
    pdf.rect(margin_x, top - header_height, 34, header_height, stroke=1, fill=0)
    pdf.setFillColor(colors.HexColor("#f1f5f2"))
    pdf.rect(margin_x, top - header_height, 34, header_height, stroke=0, fill=1)
    pdf.setFillColor(colors.HexColor("#18251f"))
    pdf.setFont("Helvetica-Bold", 7.5)
    pdf.drawCentredString(margin_x + 17, top - 19, "Couloir")

    for name, start_lane, end_lane in SECTORS:
        x = grid_left + ((start_lane - 1) * column_width)
        width = (end_lane - start_lane + 1) * column_width
        pdf.setFillColor(colors.HexColor("#e7f0ea"))
        pdf.rect(x, top - 12, width, 12, stroke=1, fill=1)
        pdf.setFillColor(colors.HexColor("#18251f"))
        pdf.setFont("Helvetica-Bold", 7.5)
        pdf.drawCentredString(x + (width / 2), top - 8.5, name)
        for lane in range(start_lane, end_lane + 1):
            lane_x = grid_left + ((lane - 1) * column_width)
            pdf.setFillColor(colors.HexColor("#f8faf9"))
            pdf.rect(lane_x, top - header_height, column_width, 18, stroke=1, fill=1)
            pdf.setFillColor(colors.HexColor("#18251f"))
            pdf.setFont("Helvetica-Bold", 7)
            pdf.drawCentredString(lane_x + (column_width / 2), top - 25.5, str(lane))

    # Grade labels, grid and route colours. Multiple routes in one cell are
    # represented by equal vertical strips so none disappear from the topo.
    for row_index, (_, label) in enumerate(GRADE_ROWS):
        y = top - header_height - ((row_index + 1) * row_height)
        pdf.setFillColor(colors.HexColor("#f1f5f2"))
        pdf.rect(margin_x, y, 34, row_height, stroke=1, fill=1)
        pdf.setFillColor(colors.HexColor("#18251f"))
        pdf.setFont("Helvetica-Bold", 7)
        pdf.drawCentredString(margin_x + 17, y + 3.4, label)
        for lane in range(1, 32):
            x = grid_left + ((lane - 1) * column_width)
            pdf.setFillColor(colors.white)
            pdf.rect(x, y, column_width, row_height, stroke=1, fill=1)
            cell_routes = cells.get((lane, label), [])
            if not cell_routes:
                continue
            strip_width = column_width / len(cell_routes)
            for index, route in enumerate(cell_routes):
                route_colour = _colour(route.color)
                pdf.setFillColor(route_colour)
                pdf.rect(x + (index * strip_width) + 0.7, y + 0.7, strip_width - 1.4, row_height - 1.4, stroke=0, fill=1)
                if len(cell_routes) == 1 and _is_light(route_colour):
                    pdf.setFillColor(colors.HexColor("#18251f"))
                    pdf.setFont("Helvetica", 5.6)
                    pdf.drawCentredString(x + (column_width / 2), y + 3.5, "blanc")

    # Stronger separators between wall sectors make the topo easy to scan.
    pdf.setStrokeColor(colors.HexColor("#18251f"))
    pdf.setLineWidth(1.25)
    for _, start_lane, _ in SECTORS[1:]:
        x = grid_left + ((start_lane - 1) * column_width)
        pdf.line(x, grid_bottom, x, top)
    pdf.setLineWidth(0.8)
    pdf.rect(margin_x, grid_bottom, grid_right - margin_x, top - grid_bottom, stroke=1, fill=0)

    total_routes = sum(len(value) for value in cells.values())
    footer_y = 21
    pdf.setFillColor(colors.HexColor("#46564d"))
    pdf.setFont("Helvetica", 7.5)
    pdf.drawString(margin_x, footer_y, "Une case coloree indique la cotation et la couleur des prises de la voie.")
    count_text = f"{total_routes} voie{'s' if total_routes != 1 else ''} - format A4 paysage"
    pdf.drawRightString(page_width - margin_x, footer_y, count_text)
    pdf.showPage()
    pdf.save()
    return output.getvalue()
