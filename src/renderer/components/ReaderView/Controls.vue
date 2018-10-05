<template>
    <div class="controls-container">
        <div class="left-container">
            <!-- Hamburger -->
            <button v-on:click="$emit('clicked-hamburger')">
                <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
                </svg>
            </button>

            <!-- Shelf -->
            <button v-on:click="$emit('clicked-shelf')">
                <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z" />
                </svg>
            </button>
            
            <!-- Bookmark -->
            <button v-on:click="$emit('clicked-bookmark')">
                <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z" />
                </svg>
            </button>

            <!-- Chapters -->
            <button v-on:click="$emit('clicked-chapters')">
                <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z" />
                </svg>
            </button>
        </div>

        <div class="right-container">
            <!-- <div class="search-container" v-on:click="$emit('clicked-search-container')">
                <input id="book-search">

                Search
                <button id='search-button' v-on:click="$emit('clicked-search')">
                    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                    </svg>
                </button>
            </div> -->
        </div>
    </div>
</template>

<style>
    .controls-container {
        width: 100%;
        display: flex;
    }

    .controls-container > * {
        margin: 0px;
        padding: 0px;

        height: 100%;
    }

    .left-container {
        width: 40%;
        float: left;

        display: flex;
    }

    .right-container {
        width: 60%;
        float: right;
    }
</style>


<script>
export default {
    data: function() {
        return {

        }
    }, 
    props: {

    }
}
</script>
