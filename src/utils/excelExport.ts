/**
 * Excel & CSV Exporter with full UTF-8 support for Azerbaijani characters (ə, ö, ü, ç, ş, ğ, ı)
 */
import { ScrapedBusiness } from '../types/scraper';

/**
 * Exports scraped businesses as a valid Excel XML Workbook (.xlsx/.xls)
 * or downloads as CSV with BOM if preferred.
 */
export function exportToExcel(leads: ScrapedBusiness[], customFilename: string = 'leads.xlsx') {
  if (!leads || leads.length === 0) {
    throw new Error('Yükləmək üçün heç bir lead tapılmadı.');
  }

  const safeFilename = customFilename.trim()
    ? customFilename.endsWith('.xlsx') || customFilename.endsWith('.xls') || customFilename.endsWith('.csv')
      ? customFilename
      : `${customFilename}.xlsx`
    : 'leads.xlsx';

  // If filename ends in .csv, export CSV
  if (safeFilename.endsWith('.csv')) {
    exportToCsv(leads, safeFilename);
    return;
  }

  // XML Spreadsheet 2003 format - Opens natively in Excel, Google Sheets, LibreOffice, Apple Numbers
  const escapeXml = (unsafe: string | number | undefined | null) => {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const rowsXml = leads
    .map(
      (b, idx) => `
      <Row>
        <Cell><Data ss:Type="Number">${idx + 1}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(b.businessName)}</Data></Cell>
        <Cell><Data ss:Type="Number">${b.rating || 0}</Data></Cell>
        <Cell><Data ss:Type="Number">${b.reviewsCount || 0}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(b.phoneNumber)}</Data></Cell>
        <Cell ss:HRef="${escapeXml(b.instagram)}"><Data ss:Type="String">${escapeXml(b.instagram)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(b.address)}</Data></Cell>
        <Cell ss:HRef="${escapeXml(b.googleMapsUrl)}"><Data ss:Type="String">${escapeXml(b.googleMapsUrl)}</Data></Cell>
      </Row>`
    )
    .join('');

  const excelXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#111827"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#18181B" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Leads">
  <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="20">
   <Column ss:Width="40"/>
   <Column ss:Width="200"/>
   <Column ss:Width="70"/>
   <Column ss:Width="70"/>
   <Column ss:Width="140"/>
   <Column ss:Width="220"/>
   <Column ss:Width="280"/>
   <Column ss:Width="240"/>
   <Row ss:StyleID="HeaderStyle">
    <Cell><Data ss:Type="String">№</Data></Cell>
    <Cell><Data ss:Type="String">Biznes Adı</Data></Cell>
    <Cell><Data ss:Type="String">Reytinq</Data></Cell>
    <Cell><Data ss:Type="String">Rəy Sayı</Data></Cell>
    <Cell><Data ss:Type="String">Telefon Nömrəsi</Data></Cell>
    <Cell><Data ss:Type="String">Instagram Linki</Data></Cell>
    <Cell><Data ss:Type="String">Ünvan</Data></Cell>
    <Cell><Data ss:Type="String">Google Maps Linki</Data></Cell>
   </Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([excelXml], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });

  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Fallback / alternative CSV export with UTF-8 BOM
 */
export function exportToCsv(leads: ScrapedBusiness[], filename: string = 'leads.csv') {
  const headers = [
    '№',
    'Biznes Adı',
    'Reytinq',
    'Rəy Sayı',
    'Telefon Nömrəsi',
    'Instagram Linki',
    'Ünvan',
    'Google Maps Linki',
  ];

  const rows = leads.map((b, idx) => [
    idx + 1,
    `"${(b.businessName || '').replace(/"/g, '""')}"`,
    b.rating,
    b.reviewsCount,
    `"${b.phoneNumber || ''}"`,
    `"${b.instagram || ''}"`,
    `"${(b.address || '').replace(/"/g, '""')}"`,
    `"${b.googleMapsUrl || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
