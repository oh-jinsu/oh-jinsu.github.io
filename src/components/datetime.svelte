<script>
    export let date
</script>

<time datetime={date}>{ new Date(date).toLocaleDateString("ko") }</time>