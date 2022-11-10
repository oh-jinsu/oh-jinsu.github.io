export const transform = async ([key, resolver]) => {
    const href = key.replace(".md", "")
    
    const { metadata, default: file } = await resolver();
    
    const category = metadata?.keywords?.[0]

    const { html } = file.render();

    const description = html.match(/<p>*.+<\/p>/g).slice(0, 1).join().replace(/<[^>]*>/g, "")

    const thumbnail = html.match(/<[^>]*class="thumbnail.*">/g)?.[0].match(/src="[^"]*"/g)?.[0].replace(/(src=|")/g, "");

    return {
        href,
        ...metadata,
        category,
        thumbnail,
        description,
        html
    }
}