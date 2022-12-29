<script>
    import Meta from "$components/meta.svelte"
    import Main from "$components/main.svelte"
    import Footer from "$components/footer.svelte"
    import Post from "$components/post.svelte"
    import Datetime from "$components/datetime.svelte"

    import { TITLE } from "$constants"
	import Contact from "$components/contact.svelte";

    export let data;

    const { cur, prev, next } = data;

    const { title, description, keywords, date, thumbnail, html } = cur;
</script>

<Meta { title } { description } { keywords } { thumbnail } />
<Main>
    <header>
        <p>
            <a href="/">{ TITLE }</a>
        </p>
        <h1>{title}</h1>
        <p>
            {#if date}
                <Datetime { date } />
            {/if}
            <br />
        </p>
    </header>
    <section class="content">
        {@html html}
    </section>
    <footer>
        <Contact />
        <h2>다른 게시글</h2>
        {#if prev}
            <Post item={prev} />
        {/if}
        {#if next}
            <Post item={next} />
        {/if}
    </footer>
</Main>
<Footer />

<style>
    header {
        margin: 32px 0;

        border: 4px ridge;

        padding: 0 16px;
    }

    .content {
        padding: 0 8px;
    }

    footer h2 {
        padding: 0 8px;
    }
</style>
