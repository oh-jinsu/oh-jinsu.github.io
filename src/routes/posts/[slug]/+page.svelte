<script>
    import Meta from "$components/meta.svelte"
    import Header from "$components/header.svelte"
    import Main from "$components/main.svelte"
    import Footer from "$components/footer.svelte"
    import Datetime from "$components/datetime.svelte"

    import { TITLE } from "$constants"
	import Contact from "../../../components/contact.svelte";

    export let data;

    const { cur } = data;

    const { title, description, keywords, date, thumbnail, html } = cur;
</script>

<Meta { title } { description } { keywords } { thumbnail } />
<Header>
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
</Header>
<Main>
    <section class="content">
        {@html html}
    </section>
    <Contact />
</Main>
<Footer />

<style>
    .content {
        padding: 0 8px;
    }

    section {
        list-style: none;
    }
</style>