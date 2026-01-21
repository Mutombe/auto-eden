# core/exports.py
"""
Export service for generating Excel, CSV, and PDF exports.
Supports streaming for large datasets.
"""
import csv
import io
from typing import List, Dict, Any, Iterator
from django.http import StreamingHttpResponse, HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import xlsxwriter
from datetime import datetime


class ExportService:
    """Service class for generating exports."""

    VEHICLE_COLUMNS = {
        'id': 'ID',
        'make': 'Make',
        'model': 'Model',
        'year': 'Year',
        'vin': 'VIN',
        'mileage': 'Mileage',
        'price': 'Price',
        'proposed_price': 'Proposed Price',
        'listing_type': 'Listing Type',
        'verification_state': 'Status',
        'fuel_type': 'Fuel Type',
        'transmission': 'Transmission',
        'body_type': 'Body Type',
        'location': 'Location',
        'owner__username': 'Owner',
        'created_at': 'Created At',
    }

    BID_COLUMNS = {
        'id': 'ID',
        'vehicle__make': 'Vehicle Make',
        'vehicle__model': 'Vehicle Model',
        'vehicle__year': 'Vehicle Year',
        'amount': 'Amount',
        'status': 'Status',
        'bidder__username': 'Bidder',
        'message': 'Message',
        'created_at': 'Created At',
    }

    USER_COLUMNS = {
        'id': 'ID',
        'username': 'Username',
        'email': 'Email',
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'is_active': 'Active',
        'is_staff': 'Staff',
        'date_joined': 'Joined At',
    }

    @staticmethod
    def get_columns(data_type: str) -> Dict[str, str]:
        """Get column definitions for a data type."""
        columns_map = {
            'vehicles': ExportService.VEHICLE_COLUMNS,
            'bids': ExportService.BID_COLUMNS,
            'users': ExportService.USER_COLUMNS,
        }
        return columns_map.get(data_type, ExportService.VEHICLE_COLUMNS)

    @staticmethod
    def prepare_row(item: Any, columns: List[str]) -> List[Any]:
        """Prepare a single row for export."""
        row = []
        for col in columns:
            if '__' in col:
                # Handle nested attributes
                parts = col.split('__')
                value = item
                for part in parts:
                    value = getattr(value, part, None) if value else None
            else:
                value = getattr(item, col, None)

            # Format special values
            if isinstance(value, datetime):
                value = value.strftime('%Y-%m-%d %H:%M')
            elif value is None:
                value = 'N/A'
            elif isinstance(value, bool):
                value = 'Yes' if value else 'No'

            row.append(value)
        return row

    @staticmethod
    def generate_csv_stream(queryset, columns: List[str], column_headers: List[str]) -> Iterator[str]:
        """Generate CSV content as a stream."""
        # Yield headers
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(column_headers)
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        # Yield data rows in batches
        batch_size = 1000
        for i, item in enumerate(queryset.iterator()):
            row = ExportService.prepare_row(item, columns)
            writer.writerow(row)

            if (i + 1) % batch_size == 0:
                yield output.getvalue()
                output.seek(0)
                output.truncate(0)

        # Yield remaining rows
        yield output.getvalue()

    @staticmethod
    def export_to_csv(queryset, columns: List[str], column_headers: List[str], filename: str) -> StreamingHttpResponse:
        """Export data to CSV with streaming."""
        response = StreamingHttpResponse(
            ExportService.generate_csv_stream(queryset, columns, column_headers),
            content_type='text/csv'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
        return response

    @staticmethod
    def export_to_excel(queryset, columns: List[str], column_headers: List[str], filename: str) -> HttpResponse:
        """Export data to Excel."""
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output, {'in_memory': True})
        worksheet = workbook.add_worksheet('Data')

        # Add header formatting
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#e12d39',
            'font_color': 'white',
            'border': 1,
        })

        cell_format = workbook.add_format({
            'border': 1,
        })

        # Write headers
        for col_num, header in enumerate(column_headers):
            worksheet.write(0, col_num, header, header_format)

        # Write data rows
        row_num = 1
        for item in queryset.iterator():
            row = ExportService.prepare_row(item, columns)
            for col_num, value in enumerate(row):
                worksheet.write(row_num, col_num, str(value), cell_format)
            row_num += 1

        # Adjust column widths
        for col_num, header in enumerate(column_headers):
            worksheet.set_column(col_num, col_num, max(len(header) + 2, 15))

        workbook.close()
        output.seek(0)

        response = HttpResponse(
            output.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}.xlsx"'
        return response

    @staticmethod
    def export_to_pdf(queryset, columns: List[str], column_headers: List[str], filename: str, title: str = "Export") -> HttpResponse:
        """Export data to PDF."""
        output = io.BytesIO()
        doc = SimpleDocTemplate(output, pagesize=landscape(letter))
        elements = []
        styles = getSampleStyleSheet()

        # Add title
        title_para = Paragraph(title, styles['Heading1'])
        elements.append(title_para)

        # Prepare table data
        table_data = [column_headers]
        for item in queryset.iterator():
            row = ExportService.prepare_row(item, columns)
            table_data.append([str(v)[:50] for v in row])  # Truncate long values

        # Create table
        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e12d39')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
        ]))

        elements.append(table)

        # Build PDF
        doc.build(elements)
        output.seek(0)

        response = HttpResponse(output.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
        return response


def log_export(user, export_type: str, data_type: str, record_count: int, file_size: int = None, filters: dict = None, ip_address: str = None):
    """Log an export action."""
    from .models import ExportLog
    ExportLog.objects.create(
        user=user,
        export_type=export_type,
        data_type=data_type,
        record_count=record_count,
        file_size=file_size,
        filters_applied=filters or {},
        ip_address=ip_address,
    )
