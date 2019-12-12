<template>
    <div class="shelf-book-container">
        <div class="shelf-book-grid-container">
            <template v-for="(element, index) in booksToRender">
                <shelf-book
                    :key="index"
                    :state="element.state"
                    :metadata="element.metadata"
                    :path="element.path"
                >
                </shelf-book>
            </template>
        </div>
    </div>
</template>

<script>
    import ShelfBook from '@views/ShelfView/ShelfBook.vue'
    import bookDataState from '@views/ShelfView/BookDataState'
    import * as Promise from 'bluebird'
    import { getAppSetting } from '@app/appWrapperProxy'
    import bookModel from '@models/book'

    export default {
        components: {
            ShelfBook
        },
        data: function() {
            return {
                books: [
                    // {
                    //     path: 'data/path',
                    //     state: 'state',
                    //     metadata: 'metadata'
                    // }
                ],
                booksToRender: []
            }
        },
        name: "ShelBookGrid.vue",
        props: {
            bookDataPaths: []
        },
        mounted: function() {

        },
        methods: {
            beginLoad: async function (path) {
                const model = bookModel
                await model.fromFile(path)
                return model
            },
            updateBooks: function (value) {
                let toLoad = []
                const paths = this.books.map((b) => {return b.path})

                for(let bookPath in value) {
                    if(!(bookPath in paths))
                        toLoad.push(
                            {
                                path: bookPath,
                                state: bookDataState.Pending,
                                metadata: {}
                            })
                }

                const loadingTimeout = getAppSetting('bookProcessedDataLoadingTimeout')

                for(let el in toLoad) {
                    this.books.push(el)

                    const loadingPromise = this.beginLoad(el)

                    loadingPromise
                    .then(model => {
                        //update element with loaded data
                        this.books[el].state = bookDataState.Loaded
                        this.books[el].metadata = model
                    })
                    .catch(err => {
                        //shit happens
                        this.books[el].state = bookDataState.Corrupted
                        log.error(`unable to load book data: ${el}, error: ${err}`)
                    })

                    if(loadingTimeout > 0)
                        loadingPromise.timeout(loadingTimeout)
                }
            },
            applyFilter: function (filterFunction) {
                this.booksToRender = this.books.filter(book => {
                        return filterFunction(book)
                    }
                )
            },
            clearFilter: function () {
                this.booksToRender = this.books
            }
        },
        watch: {
            books: function (value) {
                this.updateBooks(value)
            }
        }
    }
</script>

<style scoped>
    .shelf-book-grid-container {
        position: relative;

        margin: 10% 15%;
        padding: 0;

        display: grid;
        grid-template-columns: auto auto;
        grid-template-rows: auto;
    }
</style>