export const structedData = (headline, description, image, date) => {
    return `<script type="application/ld+json">{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${headline}",
    "description": "${description}",${image ? `\nimage": "${image},` : ""}
    "author": {
        "@type": "Person",
        "name": "Jinsu Oh",
        "url": "https://oh-jinsu.github.io"
    },
    "datePublished": "${date}",
    "dateModified": "${date}"
}</script>`
}