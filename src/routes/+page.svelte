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
        <h1>Welcome to my blog</h1>
        {@html html}
        <Contact />
        <h2>새로운 게시글</h2>
    </div>
    <ol>
        {#each posts as item}
            <Post { item } />
        {/each}
    </ol>
</Main>
<Footer />

<style>
    .content {
        padding: 0 16px;
    }

    ol {
        list-style: none;

        padding: 0;
    }
</style>