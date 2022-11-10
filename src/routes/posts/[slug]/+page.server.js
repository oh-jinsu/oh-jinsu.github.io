import { error } from "@sveltejs/kit";
import { transform } from "$functions/transform";

export const csr = false;

export const prerender = true;

export async function load({ params }) {
    const unsortedPosts = await Promise.all(Object.entries(import.meta.glob("/posts/**/*.md")).map(transform))
    
    const posts = unsortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date))

    let index = posts.findIndex(({ href }) => href.includes(params.slug))

    if (index == -1) {
        throw error(404, "Not found");
    }

    let prev = (() => {
        if (index == 0) {
            return null;
        }

        return posts[index - 1]
    })()

    let next = await (() => {
        if (index == posts.length - 1) {
            return null;
        }

        return posts[index + 1]
    })()

    return {
        prev,
        next,
        cur: posts[index],
    }
}