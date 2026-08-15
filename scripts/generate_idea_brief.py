from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "morrow-track3-idea-brief.pdf"

INK = colors.HexColor("#101713")
MUTED = colors.HexColor("#536059")
LIME = colors.HexColor("#A9F52B")
PAPER = colors.HexColor("#F4F6F0")
LINE = colors.HexColor("#CFD6CE")


def section(title: str, body: str, styles: dict[str, ParagraphStyle]) -> list:
    return [
        Paragraph(title.upper(), styles["label"]),
        Spacer(1, 2.2 * mm),
        Paragraph(body, styles["body"]),
    ]


def build() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=17 * mm,
        leftMargin=17 * mm,
        topMargin=14 * mm,
        bottomMargin=13 * mm,
        title="Morrow - Track 3 concept brief",
        author="Saai Aravindh Raja",
    )

    base = getSampleStyleSheet()
    styles = {
        "kicker": ParagraphStyle(
            "Kicker",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=10,
            textColor=MUTED,
            tracking=1.2,
        ),
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Times-Bold",
            fontSize=35,
            leading=37,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=0,
        ),
        "deck": ParagraphStyle(
            "Deck",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=11.2,
            leading=16,
            textColor=INK,
        ),
        "label": ParagraphStyle(
            "Label",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=9,
            textColor=colors.HexColor("#4B6B16"),
            tracking=1.1,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=13.4,
            textColor=INK,
            spaceAfter=0,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=11.8,
            textColor=INK,
        ),
        "proof": ParagraphStyle(
            "Proof",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10.4,
            leading=14.8,
            textColor=INK,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=6.8,
            leading=9,
            textColor=MUTED,
        ),
    }

    story = [
        Paragraph("TRACK 3 / AI-NATIVE COMMERCE", styles["kicker"]),
        Spacer(1, 3.5 * mm),
        Paragraph("Morrow", styles["title"]),
        Spacer(1, 2 * mm),
        Paragraph(
            "A merchant-side commitment layer for a world where AI agents become first-class customers.",
            styles["deck"],
        ),
        Spacer(1, 5.5 * mm),
    ]

    two_columns = Table(
        [[
            section(
                "The problem",
                "Agents can reserve scarce tables, appointments, tickets, rentals, or stock at machine speed while intending to complete only one purchase. The merchant carries the cost of that uncertainty.",
                styles,
            ),
            section(
                "The solution",
                "The merchant exposes a paid, time-boxed commitment through an agent-readable API. It is non-refundable if it expires and credited in full when exercised on time. This gives scarce inventory an explicit price and state transition.",
                styles,
            ),
        ]],
        colWidths=[86 * mm, 86 * mm],
        hAlign="LEFT",
    )
    two_columns.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (0, 0), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 7 * mm),
            ("LEFTPADDING", (1, 0), (1, 0), 7 * mm),
            ("RIGHTPADDING", (1, 0), (1, 0), 0),
            ("LINEBEFORE", (1, 0), (1, 0), 0.6, LINE),
        ])
    )
    story.extend([two_columns, Spacer(1, 7 * mm)])

    proof = Table(
        [[
            Paragraph("60-SECOND PROOF", styles["label"]),
            Paragraph(
                "Two buyer agents accept the same <b>0.20 XSGD</b> x402 terms for one final merchant slot. The merchant selects one inventory winner. Only the winner advances to settlement; the loser pays <b>S$0</b>. The winner receives a machine-readable commitment receipt and exercises it into a booking with full credit.",
                styles["proof"],
            ),
        ]],
        colWidths=[38 * mm, 134 * mm],
        hAlign="LEFT",
    )
    proof.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PAPER),
            ("BOX", (0, 0), (-1, -1), 0.7, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 5 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5 * mm),
            ("BACKGROUND", (0, 0), (0, 0), LIME),
        ])
    )
    story.extend([proof, Spacer(1, 7 * mm)])

    fit_rows = [
        ["TRACK 3", "A new merchant API, policy, inventory decision, and receipt designed for autonomous customers."],
        ["STRAITSX", "The commitment is priced in SGD-denominated XSGD: 200000 atomic units = 0.20 XSGD."],
        ["AVALANCHE + x402", "Exact payment terms target XSGD on Avalanche C-Chain mainnet (eip155:43114)."],
        ["AWS", "The production architecture can use atomic inventory writes, queues, signing, and monitoring. The MVP makes no AWS deployment claim."],
    ]
    fit_table = Table(
        [[Paragraph(label, styles["label"]), Paragraph(copy, styles["small"])] for label, copy in fit_rows],
        colWidths=[42 * mm, 130 * mm],
        hAlign="LEFT",
    )
    fit_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
            ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
        ])
    )
    story.extend([
        Paragraph("WHY IT FITS", styles["label"]),
        Spacer(1, 1.5 * mm),
        fit_table,
        Spacer(1, 6 * mm),
    ])

    boundary = Table(
        [[
            section(
                "What exists now",
                "A polished Vercel merchant app, capability and x402 payment-term endpoints, a sample checkout race, a machine-readable receipt, and an Anvil mainnet-fork settlement rehearsal.",
                styles,
            ),
            section(
                "Honest boundary",
                "The hosted app rejects signed payment authorizations and does not broadcast them. No verified mainnet settlement hash is configured, and AWS remains a production mapping rather than a deployment claim.",
                styles,
            ),
        ]],
        colWidths=[86 * mm, 86 * mm],
        hAlign="LEFT",
    )
    boundary.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (0, 0), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 7 * mm),
            ("LEFTPADDING", (1, 0), (1, 0), 7 * mm),
            ("RIGHTPADDING", (1, 0), (1, 0), 0),
            ("LINEBEFORE", (1, 0), (1, 0), 0.6, LINE),
        ])
    )
    story.extend([
        boundary,
        Spacer(1, 7 * mm),
        Paragraph(
            "NOT ONLY RESTAURANTS  /  clinic appointments  /  ticket allotments  /  equipment rentals  /  limited inventory",
            styles["kicker"],
        ),
        Spacer(1, 5 * mm),
        Paragraph(
            "MORROW  |  STRAITSX AGENTIX PLAYGROUND 2026  |  SAAI ARAVINDH RAJA",
            styles["footer"],
        ),
    ])

    document.build(story)


if __name__ == "__main__":
    build()
