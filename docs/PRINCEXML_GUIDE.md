# PrinceXML Comprehensive Guide

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Command-Line Usage](#command-line-usage)
5. [CSS Styling for PDFs](#css-styling-for-pdfs)
6. [Paged Media Features](#paged-media-features)
7. [Generated Content](#generated-content)
8. [Working with Graphics](#working-with-graphics)
9. [JavaScript Integration](#javascript-integration)
10. [Server Integration](#server-integration)
11. [Prince for Books](#prince-for-books)
12. [Common Recipes](#common-recipes)
13. [Best Practices](#best-practices)

---

## Overview

### What is PrinceXML?

Prince is a powerful software tool that converts HTML and XML content into professional-quality PDF documents. It seamlessly transforms web content into documents you can print, download, and archive using standard HTML/CSS technologies.

### Key Features

**Layout Capabilities:**
- Headers, footers, and page numbering
- Tables, lists, columns, and floats
- Footnotes and cross-references
- Duplex printing support
- Multi-column layouts and grid systems

**Web Standards Support:**
- HTML, XHTML, XML, and SVG input formats
- Comprehensive CSS support (including CSS Grid and Flexbox)
- JavaScript/ECMAScript functionality
- Multiple image formats (JPEG, PNG, GIF, TIFF, WebP, AVIF)

**PDF Features:**
- Bookmarks, hyperlinks, and metadata
- Document encryption and security
- Font embedding and subsetting
- PDF attachments
- Color profile management

**Typography:**
- OpenType, TrueType, and CFF font support
- Unicode support for multiple languages
- Advanced hyphenation
- Ligatures and OpenType features

### Primary Use Cases

1. **Electronic Publishing** - Convert web content into professional books and publications
2. **Report Generation** - Create formatted business reports and documents
3. **Invoice and Receipt Generation** - Produce PDF invoices from HTML templates
4. **Document Archiving** - Convert web content to archival PDF/A format
5. **Custom PDF Production** - Design documents with specific graphic requirements

---

## Installation

### System Requirements

Prince is available for:
- Windows (32-bit and 64-bit)
- macOS
- Linux (multiple distributions: Debian, Ubuntu, CentOS, RedHat, Alpine)
- FreeBSD

Disk space requirement: 16MB

### Platform-Specific Installation

#### Windows

1. Download the installer from [www.princexml.com/download](https://www.princexml.com/download/)
2. Run the executable installer
3. Follow the installation wizard
4. Accept the license agreement
5. Select installation directory

Note: The GUI is available exclusively on Windows.

#### macOS

1. Download the package from the website
2. Extract the downloaded package
3. Open Terminal and navigate to the extracted directory
4. Run the installation script:
   ```bash
   ./install.sh
   ```
5. You may need root access:
   ```bash
   sudo ./install.sh
   ```
6. Add the `bin/` subdirectory to your PATH:
   ```bash
   export PATH="/path/to/prince/bin:$PATH"
   ```

#### Linux (Debian/Ubuntu)

Using gdebi for automatic dependency resolution:
```bash
sudo gdebi prince_*.deb
```

Or using dpkg:
```bash
sudo dpkg -i prince_*.deb
sudo apt-get install -f
```

#### Linux (CentOS/RedHat)

```bash
sudo yum install prince-*.rpm
```

#### Generic Installation (Alpine Linux, etc.)

1. Download the generic tarball
2. Extract it:
   ```bash
   tar xzf prince-*.tar.gz
   ```
3. Run the installation script:
   ```bash
   cd prince-*
   sudo ./install.sh
   ```

### License Installation

Free versions of Prince add a watermark to generated PDFs. If you've purchased a license:

1. Receive your license file via email
2. Install it in the `lib/prince/license` directory
3. Verify installation:
   ```bash
   prince --show-license
   ```

---

## Getting Started

### Basic Usage

The simplest way to use Prince:

```bash
prince input.html -o output.pdf
```

### Basic HTML Document

Create a simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My First PDF</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 2cm;
    }
    h1 {
      color: #333;
    }
  </style>
</head>
<body>
  <h1>Hello, Prince!</h1>
  <p>This is my first PDF generated with PrinceXML.</p>
</body>
</html>
```

Convert it:

```bash
prince document.html -o document.pdf
```

### Multiple Input Files

Combine multiple HTML files into a single PDF:

```bash
prince chapter1.html chapter2.html chapter3.html -o book.pdf
```

Or use a file list:

```bash
prince -l filelist.txt -o output.pdf
```

Where `filelist.txt` contains:
```
chapter1.html
chapter2.html
chapter3.html
```

---

## Command-Line Usage

### Core Options

**Input/Output:**
```bash
prince input.html -o output.pdf          # Specify output file
prince -i html input.xml -o output.pdf   # Force input format
prince --baseurl=http://example.com/ input.html -o output.pdf
```

**Styling:**
```bash
prince -s style.css input.html -o output.pdf           # Apply external stylesheet
prince --media=print input.html -o output.pdf          # Specify media type
prince --page-size=A4 input.html -o output.pdf         # Set page size
prince --page-margin=2cm input.html -o output.pdf      # Set margins
```

**JavaScript:**
```bash
prince --javascript input.html -o output.pdf           # Enable JavaScript
prince -j --script=custom.js input.html -o output.pdf  # Run external script
```

### Logging and Debugging

```bash
prince -v input.html -o output.pdf              # Verbose output
prince --debug input.html -o output.pdf         # Debug messages
prince --log=conversion.log input.html -o output.pdf   # Log to file
prince --no-warn-css input.html -o output.pdf   # Suppress CSS warnings
```

### Network Options

```bash
prince --no-network input.html -o output.pdf                    # Disable HTTP
prince --auth-user=username --auth-password=pass url -o out.pdf # HTTP auth
prince --http-proxy=proxy.example.com:8080 url -o output.pdf    # Use proxy
prince --http-timeout=30 url -o output.pdf                      # Set timeout
prince --insecure https://example.com -o output.pdf             # Ignore SSL errors
```

### PDF Metadata and Security

```bash
# Metadata
prince --pdf-title="My Document" \
       --pdf-author="John Doe" \
       --pdf-keywords="report, finance" \
       input.html -o output.pdf

# Encryption and security
prince --encrypt \
       --user-password=user123 \
       --owner-password=owner456 \
       --disallow-print \
       --disallow-copy \
       input.html -o output.pdf
```

### Font Options

```bash
prince --no-embed-fonts input.html -o output.pdf  # Don't embed fonts
```

### Raster Output (Convert to Images)

```bash
# Output as PNG images (one per page)
prince --raster-output=page-%d.png input.html

# JPEG output with custom quality
prince --raster-output=page-%d.jpg \
       --raster-format=jpeg \
       --raster-jpeg-quality=85 \
       --raster-dpi=150 \
       input.html

# Only convert first page
prince --raster-output=first.png \
       --raster-pages=first \
       input.html
```

### Advanced Options

```bash
prince --fail-safe input.html -o output.pdf        # Abort on any error
prince --job=config.json                           # Use JSON job config
prince --control                                   # Enable Prince Control Protocol
prince --shell                                     # Interactive JavaScript shell
```

---

## CSS Styling for PDFs

### Standard CSS Support

Prince supports modern CSS including:
- CSS Grid Layout
- Flexbox
- Multi-column layouts
- Transforms
- Filters
- Transitions (for JavaScript-generated content)

### Prince-Specific CSS Properties

Properties prefixed with `-prince-` are Prince extensions:

#### Page Control

```css
@page {
  size: A4 portrait;
  margin: 2cm;
  bleed: 3mm;  /* For crop marks */
}

/* Named pages */
@page chapter {
  @top-center {
    content: "Chapter " counter(chapter);
  }
}

h1 {
  page: chapter;  /* Use named page */
  break-before: recto;  /* Start on right page */
}
```

#### Bookmarks

```css
h1 {
  bookmark-label: content();  /* Use element text */
  bookmark-level: 1;
  bookmark-state: open;
}

h2 {
  bookmark-label: content();
  bookmark-level: 2;
  bookmark-state: closed;
}
```

#### Float Management

```css
.sidebar {
  float: left;
  float-placement: top;  /* Place at top of page */
  float-reference: page;  /* Float to page, not container */
}

.footnote {
  float: footnote;  /* Create footnote */
  footnote-style-position: inside;
}
```

#### Typography

```css
p {
  hyphens: auto;
  hyphenate-lines: 2;  /* Max consecutive hyphenated lines */
  hyphenate-patterns: url(hyphen-en.dic);
}

h1 {
  font-variant-ligatures: historical-ligatures;
  font-variant-caps: small-caps;
}

/* OpenType features */
.fancy {
  font-variant: prince-opentype("swsh", "hist");
}
```

---

## Paged Media Features

### Page Size and Margins

```css
/* Standard page sizes */
@page { size: A4; }
@page { size: letter; }
@page { size: A4 landscape; }

/* Custom dimensions */
@page { size: 8.5in 11in; }

/* Margins */
@page {
  margin: 2cm 3cm;  /* top/bottom left/right */
  margin-top: 3cm;
  margin-bottom: 2cm;
  margin-inside: 3cm;   /* For duplex printing */
  margin-outside: 2cm;
}
```

### Left and Right Pages

```css
/* Different styles for left/right pages */
@page :left {
  margin-left: 3cm;
  margin-right: 2cm;
  @bottom-left {
    content: counter(page);
  }
}

@page :right {
  margin-left: 2cm;
  margin-right: 3cm;
  @bottom-right {
    content: counter(page);
  }
}
```

### First Page

```css
@page :first {
  margin-top: 5cm;  /* Extra space on first page */
  @top-center {
    content: none;  /* No header on first page */
  }
}
```

### Page Breaks

```css
h1 {
  break-before: page;  /* Always start new page */
  break-after: avoid;  /* Avoid break after */
}

h2 {
  break-before: recto;  /* Start on right-hand page */
}

table {
  break-inside: avoid;  /* Keep table together */
}

.keep-together {
  page-break-inside: avoid;
}
```

### Page Margin Boxes

There are 16 page margin boxes available:

```css
@page {
  @top-left { content: "Top Left"; }
  @top-center { content: "Top Center"; }
  @top-right { content: "Top Right"; }

  @bottom-left { content: counter(page); }
  @bottom-center { content: "Bottom Center"; }
  @bottom-right { content: "© 2025 Company"; }

  @left-top { content: "Left Top"; }
  @left-middle { content: "Left Middle"; }
  @left-bottom { content: "Left Bottom"; }

  @right-top { content: "Right Top"; }
  @right-middle { content: "Right Middle"; }
  @right-bottom { content: "Right Bottom"; }
}
```

---

## Generated Content

### Page Numbers

```css
@page {
  @bottom-center {
    content: "Page " counter(page) " of " counter(pages);
  }
}

/* Start numbering from specific value */
body {
  counter-reset: page 86;
}

/* Different numbering styles */
@page {
  @bottom-center {
    content: counter(page, lower-roman);  /* i, ii, iii */
  }
}
```

### Running Headers

```css
/* Set content from chapter title */
h1 {
  string-set: chapter-title content();
}

@page {
  @top-center {
    content: string(chapter-title);
  }
}
```

### Table of Contents

HTML:
```html
<h1 id="chapter1">Chapter One</h1>
```

CSS:
```css
/* Generate TOC entries */
.toc a::after {
  content: leader('.') target-counter(attr(href), page);
}

/* Style the leader */
.toc a::after {
  content: leader(dotted) " " target-counter(attr(href), page);
}
```

JavaScript to generate TOC:
```javascript
// Find all h1 elements
var headings = document.querySelectorAll('h1');
var toc = document.getElementById('toc');

headings.forEach(function(heading, index) {
  if (!heading.id) {
    heading.id = 'heading-' + index;
  }

  var li = document.createElement('li');
  var a = document.createElement('a');
  a.href = '#' + heading.id;
  a.textContent = heading.textContent;
  li.appendChild(a);
  toc.appendChild(li);
});
```

### Cross-References

```css
/* Reference page numbers */
a[href]::after {
  content: " (page " target-counter(attr(href), page) ")";
}

/* Reference element content */
a[href]::after {
  content: " (see '" target-content(attr(href)) "')";
}
```

### Footnotes

```css
.footnote {
  float: footnote;
  footnote-style-position: inside;
}

/* Footnote call */
.footnote::footnote-call {
  content: counter(footnote);
  font-size: 80%;
  vertical-align: super;
}

/* Footnote marker */
.footnote::footnote-marker {
  content: counter(footnote) ". ";
  font-weight: bold;
}

/* Footnote area */
@page {
  @footnote {
    border-top: 1px solid black;
    margin-top: 1em;
    padding-top: 0.5em;
  }
}
```

### Counters

```css
/* Chapter counter */
body {
  counter-reset: chapter 0 section 0;
}

h1::before {
  counter-increment: chapter;
  content: "Chapter " counter(chapter) ": ";
}

h2::before {
  counter-increment: section;
  content: counter(chapter) "." counter(section) " ";
}
```

---

## Working with Graphics

### Image Formats

Prince supports:
- JPEG
- PNG
- TIFF
- GIF
- WebP
- AVIF
- SVG

### Basic Image Usage

HTML:
```html
<img src="image.jpg" alt="Description">
```

CSS:
```css
img {
  max-width: 100%;
  height: auto;
}
```

### Image Resolution

```css
img {
  -prince-image-resolution: 300dpi;  /* Set explicit DPI */
}

/* Or map 1 image pixel to 1px unit */
img {
  -prince-image-resolution: 1dppx;
}
```

### Object Fit and Position

```css
img {
  width: 200px;
  height: 200px;
  object-fit: cover;  /* cover, contain, fill, none, scale-down */
  object-position: center center;
}
```

### Background Images

```css
.header {
  background-image: url(background.jpg);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}
```

### Image Optimization

```css
/* Recompress JPEG images */
img {
  -prince-image-magic: recompress-jpeg(80);
}

/* Convert PNG to JPEG */
img.photo {
  -prince-image-magic: convert-to-jpeg;
}
```

### SVG

Inline SVG:
```html
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue" />
</svg>
```

CSS styling for SVG:
```css
circle {
  fill: blue;
  stroke: black;
  stroke-width: 2px;
}
```

Note: Prince supports SVG 1.1 but excludes scripting, animation, and vertical text.

---

## JavaScript Integration

### Enabling JavaScript

Command line:
```bash
prince --javascript input.html -o output.pdf
```

Or in HTML:
```html
<script>
// Your JavaScript code
</script>
```

### Language Support

Prince implements most of ECMAScript 5 (ES5), excluding strict mode. ES6+ features are not fully supported.

### The Prince Object

#### Complete Event

```javascript
Prince.addEventListener("complete", function() {
  console.log("PDF generation complete!");
  console.log("Total pages:", Prince.pageCount);
});
```

#### Custom CSS Functions

```javascript
// Define a custom function
Prince.addScriptFunc("myFunction", function(arg) {
  return "Result: " + arg;
});
```

CSS usage:
```css
.element::before {
  content: prince-script(myFunction("test"));
}
```

#### Box Tracking

```javascript
Prince.trackBoxes = true;

Prince.addEventListener("complete", function() {
  var boxes = Prince.getBoxes();

  boxes.forEach(function(box) {
    console.log("Element:", box.element);
    console.log("Position:", box.x, box.y);
    console.log("Size:", box.w, box.h);
    console.log("Page:", box.pageNum);
  });
});
```

#### Multi-Pass Layout

```javascript
Prince.registerPostLayoutFunc(function() {
  // Modify document after initial layout
  // Return true to trigger re-layout
  var modified = false;

  // Generate index with page numbers
  var entries = document.querySelectorAll('.index-entry');
  entries.forEach(function(entry) {
    var boxes = Prince.getPrinceBoxes(entry.target);
    if (boxes.length > 0) {
      entry.textContent += " - " + boxes[0].pageNum;
      modified = true;
    }
  });

  return modified;  // Trigger re-layout if true
});
```

### The PDF Object

```javascript
// Set PDF metadata
PDF.title = "My Document";
PDF.author = "John Doe";
PDF.subject = "Important Report";
PDF.keywords = "report, finance, 2025";
PDF.creator = "My Application";

// Encryption
PDF.encrypt({
  userPassword: "user123",
  ownerPassword: "owner456",
  allowPrint: false,
  allowCopy: false,
  allowModify: false
});

// Attach files
PDF.attachFile("data.xml", "text/xml");
PDF.attachFile("styles.css", "text/css");

// Font options
PDF.embedFonts = true;
PDF.subsetFonts = true;
```

### Common JavaScript Tasks

#### Dynamic Table of Contents

```javascript
// Find all headings
var headings = document.querySelectorAll('h1, h2, h3');
var toc = document.getElementById('toc-list');

headings.forEach(function(heading, index) {
  // Ensure heading has an ID
  if (!heading.id) {
    heading.id = 'heading-' + index;
  }

  // Create TOC entry
  var li = document.createElement('li');
  li.className = 'toc-' + heading.tagName.toLowerCase();

  var a = document.createElement('a');
  a.href = '#' + heading.id;
  a.textContent = heading.textContent;

  li.appendChild(a);
  toc.appendChild(li);
});
```

#### Sorting Tables

```javascript
function sortTable(tableId, columnIndex) {
  var table = document.getElementById(tableId);
  var tbody = table.querySelector('tbody');
  var rows = Array.from(tbody.querySelectorAll('tr'));

  rows.sort(function(a, b) {
    var aValue = a.cells[columnIndex].textContent;
    var bValue = b.cells[columnIndex].textContent;
    return aValue.localeCompare(bValue);
  });

  rows.forEach(function(row) {
    tbody.appendChild(row);
  });
}

// Sort first table by second column
sortTable('data-table', 1);
```

#### Generating Charts

```javascript
// Using Canvas API
var canvas = document.getElementById('chart');
var ctx = canvas.getContext('2d');

// Draw a simple bar chart
var data = [30, 50, 80, 60, 90];
var barWidth = 40;
var spacing = 10;

data.forEach(function(value, index) {
  var x = index * (barWidth + spacing);
  var height = value * 2;
  var y = canvas.height - height;

  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(x, y, barWidth, height);
});
```

---

## Server Integration

### Language Wrappers

Prince provides official wrappers for multiple languages:

#### PHP

Installation via Composer:
```bash
composer require yeslogic/prince-php-wrapper
```

Usage:
```php
<?php
require 'vendor/autoload.php';

use Prince\Prince;

$prince = new Prince('/usr/bin/prince');

// Set options
$prince->setHTML(true);
$prince->addStyleSheet('style.css');
$prince->setJavaScript(true);

// Convert
$result = $prince->convert_file_to_file('input.html', 'output.pdf');

if ($result) {
    echo "Success!";
} else {
    echo "Error: " . $prince->getErrors();
}

// Convert string to file
$html = '<html><body><h1>Hello</h1></body></html>';
$prince->convert_string_to_file($html, 'output.pdf');

// Convert to memory
$pdfData = $prince->convert_string_to_passthru($html);
header('Content-Type: application/pdf');
echo $pdfData;
?>
```

#### Python

```python
import subprocess

def convert_html_to_pdf(input_file, output_file):
    subprocess.run([
        'prince',
        input_file,
        '-o', output_file
    ])

# Or pipe HTML directly
def convert_string_to_pdf(html_string, output_file):
    process = subprocess.Popen(
        ['prince', '-', '-o', output_file],
        stdin=subprocess.PIPE
    )
    process.communicate(input=html_string.encode())

# Example usage
convert_html_to_pdf('input.html', 'output.pdf')
convert_string_to_pdf('<h1>Hello</h1>', 'output.pdf')
```

#### Node.js

Install wrapper:
```bash
npm install prince
```

Usage:
```javascript
const Prince = require('prince');

Prince()
  .inputs('input.html')
  .output('output.pdf')
  .execute()
  .then(() => {
    console.log('Success!');
  })
  .catch(error => {
    console.error('Error:', error);
  });

// With options
Prince()
  .inputs('input.html')
  .output('output.pdf')
  .option('javascript')
  .option('style', 'custom.css')
  .option('page-size', 'A4')
  .execute();

// Pipe to response (Express)
app.get('/pdf', (req, res) => {
  res.type('application/pdf');

  Prince()
    .inputs('template.html')
    .output(res)
    .execute()
    .catch(err => {
      res.status(500).send('Error generating PDF');
    });
});
```

#### Java

Maven dependency:
```xml
<dependency>
  <groupId>com.yeslogic</groupId>
  <artifactId>prince-java-wrapper</artifactId>
  <version>1.0</version>
</dependency>
```

Usage:
```java
import com.princexml.Prince;

public class PdfGenerator {
    public static void main(String[] args) {
        Prince prince = new Prince("/usr/bin/prince");

        // Set options
        prince.setHTML(true);
        prince.addStyleSheet("style.css");
        prince.setJavaScript(true);

        // Convert
        boolean success = prince.convert("input.html", "output.pdf");

        if (success) {
            System.out.println("Success!");
        } else {
            System.out.println("Error: " + prince.getLog());
        }
    }
}
```

#### C# / .NET

Install via NuGet:
```bash
Install-Package PrinceXMLWrapper
```

Usage:
```csharp
using Prince;

class Program
{
    static void Main()
    {
        var prince = new PrinceXML.Prince(@"C:\Program Files\Prince\engine\bin\prince.exe");

        // Set options
        prince.SetHTML(true);
        prince.AddStyleSheet("style.css");
        prince.SetJavaScript(true);

        // Convert
        bool success = prince.Convert("input.html", "output.pdf");

        if (success)
        {
            Console.WriteLine("Success!");
        }
        else
        {
            Console.WriteLine("Error: " + prince.GetLog());
        }
    }
}

// ASP.NET Core example
public IActionResult GeneratePdf()
{
    var prince = new PrinceXML.Prince(@"C:\Program Files\Prince\engine\bin\prince.exe");

    using (var ms = new MemoryStream())
    {
        prince.Convert("template.html", ms);
        return File(ms.ToArray(), "application/pdf", "document.pdf");
    }
}
```

### Cloud Deployment

#### Docker

Official Docker image:
```bash
docker pull yeslogic/prince
```

Usage:
```bash
docker run --rm -v $(pwd):/data yeslogic/prince \
  /data/input.html -o /data/output.pdf
```

Dockerfile:
```dockerfile
FROM yeslogic/prince:latest

COPY input.html /data/
WORKDIR /data

CMD ["prince", "input.html", "-o", "output.pdf"]
```

#### AWS Lambda

1. Create Lambda layer with Prince binary
2. Use wrapper in Lambda function:

```python
import json
import subprocess
import boto3

def lambda_handler(event, context):
    # Get HTML from S3 or event
    html_content = event['html']

    # Write to temp file
    with open('/tmp/input.html', 'w') as f:
        f.write(html_content)

    # Convert
    subprocess.run([
        '/opt/bin/prince',
        '/tmp/input.html',
        '-o', '/tmp/output.pdf'
    ])

    # Upload to S3
    s3 = boto3.client('s3')
    with open('/tmp/output.pdf', 'rb') as f:
        s3.put_object(
            Bucket='my-bucket',
            Key='output.pdf',
            Body=f,
            ContentType='application/pdf'
        )

    return {
        'statusCode': 200,
        'body': json.dumps('PDF generated!')
    }
```

---

## Prince for Books

### Overview

Prince for Books (`prince-books`) is a specialized version focused on professional book publishing with advanced typography and layout control.

### Key Features

#### Pagination Control

```css
/* Soft requirements for page breaks */
h1 {
  -prince-prefer: break-before;  /* Prefer break, but don't force */
}

p {
  -prince-prefer: no-break-inside;  /* Try to keep together */
}
```

#### Advanced Line Breaking

```css
/* Keep natural phrases together */
p {
  -prince-wrap-inside: phrase;
}

/* Heading-specific line breaking */
h1 {
  -prince-line-break-choices: title-lookahead;
}

h2 {
  -prince-line-break-choices: heading-lookahead;
}

/* Control forced breaks */
.poetry {
  -prince-forced-breaks: spread;
}
```

#### Spread Balancing

Automatically balances content height between facing pages to reduce orphans and widows.

```css
@page {
  -prince-spread-balance: auto;  /* Enable spread balancing */
}
```

#### Fractional Widows

```css
p {
  widows: 50% -prince-full;  /* Allow widows over 50% line width */
}
```

### Best Practices for Book Publishing

1. **Use paragraph IDs** for coordinating pagination adjustments
2. **Apply context-specific line breaking** for different heading levels
3. **Enable spread balancing** for better visual consistency
4. **Use fractional widow control** to prevent single-word lines while accepting longer ones
5. **Test with complete content** as layout decisions depend on surrounding text

---

## Common Recipes

### Recipe 1: Invoice Template

HTML:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: A4;
      margin: 2cm;
      @bottom-right {
        content: "Page " counter(page);
      }
    }

    body {
      font-family: Arial, sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #333;
      padding-bottom: 1em;
      margin-bottom: 2em;
    }

    .invoice-details {
      margin-bottom: 2em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #333;
      color: white;
      padding: 0.5em;
      text-align: left;
    }

    td {
      padding: 0.5em;
      border-bottom: 1px solid #ddd;
    }

    .total {
      text-align: right;
      font-size: 1.2em;
      font-weight: bold;
      margin-top: 1em;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h1>Company Name</h1>
      <p>123 Street<br>City, State 12345</p>
    </div>
    <div class="invoice-info">
      <h2>Invoice #12345</h2>
      <p>Date: 2025-01-15</p>
    </div>
  </div>

  <div class="invoice-details">
    <h3>Bill To:</h3>
    <p>Customer Name<br>456 Avenue<br>Town, State 67890</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Product A</td>
        <td>2</td>
        <td>$50.00</td>
        <td>$100.00</td>
      </tr>
      <tr>
        <td>Product B</td>
        <td>1</td>
        <td>$75.00</td>
        <td>$75.00</td>
      </tr>
    </tbody>
  </table>

  <div class="total">
    Total: $175.00
  </div>
</body>
</html>
```

### Recipe 2: Book with Chapters

CSS:
```css
@page {
  size: 6in 9in;
  margin: 0.75in 0.5in;
}

@page :left {
  @bottom-left {
    content: counter(page);
  }
  @top-left {
    content: string(book-title);
  }
}

@page :right {
  @bottom-right {
    content: counter(page);
  }
  @top-right {
    content: string(chapter-title);
  }
}

@page :first {
  @top-left { content: none; }
  @top-right { content: none; }
}

/* Named page for chapters */
@page chapter {
  @top-left { content: none; }
  @top-right { content: none; }
}

body {
  counter-reset: chapter 0;
  string-set: book-title "My Book";
}

h1 {
  page: chapter;
  break-before: recto;
  counter-increment: chapter;
  string-set: chapter-title "Chapter " counter(chapter) ": " content();
}

h1::before {
  content: "Chapter " counter(chapter);
  display: block;
  font-size: 0.5em;
  margin-bottom: 0.5em;
}
```

### Recipe 3: Report with Table of Contents

JavaScript to generate TOC:
```javascript
// Generate TOC
var headings = document.querySelectorAll('h1');
var toc = document.getElementById('toc');

headings.forEach(function(heading, index) {
  if (!heading.id) {
    heading.id = 'chapter-' + index;
  }

  var li = document.createElement('li');
  var a = document.createElement('a');
  a.href = '#' + heading.id;
  a.textContent = heading.textContent;
  li.appendChild(a);
  toc.appendChild(li);
});
```

CSS for TOC styling:
```css
#toc a {
  text-decoration: none;
  color: #333;
}

#toc a::after {
  content: leader('.') " " target-counter(attr(href), page);
}

#toc li {
  list-style: none;
  margin: 0.5em 0;
}
```

### Recipe 4: Watermark

```css
@page {
  @prince-overlay {
    content: "DRAFT";
    font-size: 120pt;
    font-weight: bold;
    color: rgba(255, 0, 0, 0.2);
    text-align: center;
    vertical-align: middle;
    transform: rotate(-45deg);
  }
}
```

### Recipe 5: Multi-Column Layout

```css
.article {
  column-count: 2;
  column-gap: 2em;
  column-rule: 1px solid #ccc;
}

h2 {
  column-span: all;  /* Span across columns */
  break-after: avoid;
}

img {
  max-width: 100%;
  column-span: all;
}
```

### Recipe 6: Forms with Fill-in Fields

```css
input {
  border: none;
  border-bottom: 1px solid black;
  background: transparent;
  -prince-pdf-form: text;  /* Create PDF form field */
}

input[type="checkbox"] {
  -prince-pdf-form: checkbox;
}
```

---

## Best Practices

### Performance Optimization

1. **Minimize Image Sizes**
   - Use appropriate resolution (150-300 DPI for print)
   - Compress images before conversion
   - Use `-prince-image-magic` for automatic optimization

2. **Reduce JavaScript Complexity**
   - Avoid heavy computations
   - Use multi-pass layout sparingly
   - Disable JavaScript if not needed

3. **Optimize Fonts**
   - Subset fonts when possible
   - Embed only used characters
   - Use standard fonts when appropriate

4. **Cache Resources**
   - Use `--no-network` for local resources
   - Pre-download external resources
   - Use base64 for small images

### Typography Best Practices

1. **Use Appropriate Fonts**
   - Serif fonts for body text in books
   - Sans-serif for modern documents
   - Monospace for code

2. **Set Proper Line Height**
   ```css
   p {
     line-height: 1.5;  /* 150% for readability */
   }
   ```

3. **Enable Hyphenation**
   ```css
   p {
     hyphens: auto;
     lang: en;  /* Specify language */
   }
   ```

4. **Control Widows and Orphans**
   ```css
   p {
     widows: 2;  /* Min lines at top of page */
     orphans: 2;  /* Min lines at bottom of page */
   }
   ```

### Layout Best Practices

1. **Use Semantic HTML**
   - Proper heading hierarchy (h1-h6)
   - Lists for list content
   - Tables for tabular data

2. **Plan Page Breaks**
   ```css
   h1, h2 {
     break-after: avoid;  /* Keep with following content */
   }

   table, figure {
     break-inside: avoid;  /* Keep together */
   }
   ```

3. **Design for Print**
   - Use appropriate page sizes
   - Set proper margins for binding
   - Consider duplex printing (left/right pages)

4. **Test Thoroughly**
   - View at actual size
   - Test on different page sizes
   - Verify all links and bookmarks

### Debugging Tips

1. **Use Verbose Logging**
   ```bash
   prince -v --debug --log=debug.log input.html -o output.pdf
   ```

2. **Validate CSS**
   - Check for CSS warnings
   - Test with `--no-warn-css` temporarily to focus on errors

3. **Inspect Box Layout**
   ```javascript
   Prince.trackBoxes = true;
   Prince.addEventListener("complete", function() {
     Prince.getBoxes().forEach(function(box) {
       console.log(box.element.id, box);
     });
   });
   ```

4. **Test Incrementally**
   - Start with simple HTML
   - Add complexity gradually
   - Isolate problematic sections

### Security Considerations

1. **Sanitize User Input**
   - Never directly use user HTML without validation
   - Escape special characters
   - Validate URLs and file paths

2. **Disable Network When Possible**
   ```bash
   prince --no-network input.html -o output.pdf
   ```

3. **Use PDF Encryption**
   ```bash
   prince --encrypt --user-password=pass input.html -o output.pdf
   ```

4. **Validate Input Files**
   - Check file types
   - Limit file sizes
   - Scan for malicious content

### Licensing Considerations

1. **Install License File** to remove watermarks
2. **Check License Terms** for deployment scenarios
3. **Monitor Usage** for compliance with license limits
4. **Keep License Secure** - don't commit to version control

---

## Additional Resources

### Official Documentation
- Main website: [www.princexml.com](https://www.princexml.com)
- User Guide: [www.princexml.com/doc/](https://www.princexml.com/doc/)
- CSS Reference: [www.princexml.com/doc/css-props/](https://www.princexml.com/doc/css-props/)
- Installation Guide: [www.princexml.com/doc/installing/](https://www.princexml.com/doc/installing/)

### Community
- User Forums: Available on the official website
- Email Support: Contact through the website
- Samples: Browse examples on the website

### Related Technologies
- HTML5 and CSS3 specifications
- Paged Media CSS specifications
- PDF specification
- SVG specification

---

## Conclusion

PrinceXML is a powerful tool for converting HTML and XML to professional PDF documents. With its comprehensive CSS support, JavaScript integration, and specialized features for paged media, it enables developers to create sophisticated documents using familiar web technologies.

Key takeaways:
- Use standard HTML/CSS for most layouts
- Leverage Prince-specific CSS properties for advanced features
- Enable JavaScript only when needed for dynamic content
- Test thoroughly with actual content and page sizes
- Follow best practices for performance and typography

Start simple, test incrementally, and gradually add complexity as needed. The combination of web standards and print-specific features makes Prince a versatile solution for document generation needs.
