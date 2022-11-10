import { transform } from "$functions/transform"

export const prerender = true;

export async function load() {
    const readme = transform(Object.entries(import.meta.glob("/README.md"))[0]);
 
    const unsortedPosts = await Promise.all(Object.entries(import.meta.glob("/posts/**/*.md")).map(transform))
    
    const posts = unsortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date))

    return {
        readme,
        posts
    };
}