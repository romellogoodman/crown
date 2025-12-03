import { defineConfig } from 'crown';

export default defineConfig({
  input: {
    content: 'src/content/**/*.md',
    template: 'src/templates/layout.html',
    styles: 'src/styles.css',
  },
  output: {
    html: 'dist/book.html',
    pdf: 'dist/book.pdf',
  },
  metadata: {
    title: 'My Book',
    author: 'Your Name',
    subject: 'A book created with Crown',
    keywords: ['book', 'crown', 'pdf'],
    lang: 'en',
  },
  page: {
    size: '5.5in 8.5in',
    margins: {
      top: '0.75in',
      bottom: '0.75in',
      inside: '0.75in',
      outside: '0.5in',
    },
  },
  prince: {
    javascript: true,
    verbose: false,
  },
  devServer: {
    port: 3000,
    open: true,
  },
});
