<script>
    import Meta from "$components/meta.svelte"
    import Footer from "$components/footer.svelte"
    import Main from "$components/main.svelte"
    import Post from "$components/post.svelte"
    import Contact from "$components/contact.svelte"

    export let data;

    const { readme, posts } = data

    const { summary, html } = readme
</script>

<Meta description={summary} />
<Main>
    <div class="content">
        {@html html}
    </div>
    <Contact />
    <h2>새로운 게시글</h2>
    <ol>
        {#each posts as item}
            <li>
                <Post { item } />
            </li>
        {/each}
    </ol>
</Main>
<Footer />

<style>
    h2 {
        padding: 0 8px;
    }

    .content {
        padding: 0 8px;
    }

    ol {
        list-style: none;

        padding: 0;
    }
</style>
