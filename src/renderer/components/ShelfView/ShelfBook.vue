<template>
    <div class="container"
         :class="{
            pending: this.loaded !== true,
            corrupted: this.loaded === true && this.corrupted === true,
            loaded: this.loaded === true && this.corrupted === false
         }">
        <div class="title">{{title}}}</div>
        <div class="data-container">
            <div>{{author}}</div>
            <div>{{publisher}}</div>
        </div>
    </div>
</template>

<script>
    import BookDataState from '@views/ShelfView/BookDataState'

    export default {
        name: "ShelfBook.vue",
        data: function() {
            return {
                loaded: false,
                corrupted: false
            }
        },
        props: {
            path: String,
            state: String,
            metadata: null
        },
        computed: {
            title: function() {
                if(this.metadata !== null)
                    return this.metadata.get('title')
                else
                    return '-'
            },
            publisher: function() {
                if(this.metadata !== null)
                    return 'publisher: ' + this.metadata.get('publisher')
                else
                    return 'publisher: -'
            },
            author: function () {
                if(this.metadata !== null)
                    return 'author: ' + this.metadata.get('author')
                else
                    return 'author: -'
            }
        },
        watch: {
            metadata: function (value) {
                if(value === BookDataState.Corrupted) {
                    this.loaded = true
                    this.corrupted = true
                } else if(value === BookDataState.Loaded) {
                    this.loaded = true
                    this.corrupted = false
                }
            }
        }
    }
</script>
<style scoped>
    .container {
        border: 0;
        margin: 2em 4em;
        padding: 0;

        width: 6em;
        height: 9em;
    }

    .pending {
        background-color: gray;
    }

    .corrupted {
        background-color: red;
    }

    .loaded {
        background-color: green;
    }

    .title {
        font-size: 16pt;
        text-space: 1px;
    }
</style>