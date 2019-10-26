<template>
    <div :class="`checkboxgroup-container` + checkboxGroupId">
        <template v-for="(value, index) in this.values">
            <!--suppress HtmlFormInputWithoutLabel -->
            <input
                    :ref="`item`+checkboxGroupId+index"
                    :id="checkboxGroupId + index" type="checkbox"
                    v-model="selected"
            >
            <label v-for="checkboxGroupId + index">
                {{value}}
            </label>
        </template>
    </div>
</template>

<script>
    export default {
        name: "CheckboxGroup.vue",
        props: {
            values: Array,
            multiSelect: Boolean,
            defaultSelection: Number
        },
        data() {
            return {
                items: {
                    ids: 0,
                    selfEditing: false,
                    selected: [],
                    checkboxGroupId: Math.random().toString(36).slice(-5) //TODO: <-- make some more reliable random id generator :>
                }
            }
        },
        created() {
            if(this.values.length < 0)
                throw new Error(`you dumb`)

            if(this.multiArgs === false) {
                if
                (
                    this.defaultSelection.length > this.values.length ||
                    this.defaultSelection.length < 0
                ) {
                    this.defaultSelection = 0
                }

                this.getItem(this.defaultSelection).checked = true
            }
        },
        watch: {
            selected: function() {
                if(this.multiSelect === true) {
                    for(let i in this.values) {
                        if(this.selected.contains(this.values[i]))
                        {
                            this.emit('changed', this.values[i], true)
                        } else {
                            this.emit('changed', this.values[i], false)
                        }
                    }
                    return
                }

                //ONLY FOR NON-MULTISELECT
                if(this.selfEditing === true) { //we have to better things then looping around
                    this.selfEditing = false
                } else {
                    if(this.selected.length < 0) {//??
                        this.getItem(0).checked = true //default
                    }
                    else if(this.selected.length === 1) {
                        this.$emit('changed', this.selected[0], true)
                    } else {
                        //new array reference, but still pointing same items
                        let copy = this.selected.splice(0)
                        copy[0] = copy[1] //override current selection
                        copy.pop()
                        this.$emit('changed', copy[0], true) //emit change

                        this.selfEditing = true
                        this.selected = copy
                    }
                }
            }
        },
        methods: {
            getItem: function (index) {
                return this.$refs[`item`+this.checkboxGroupId+index]
            }
        }
    }
</script>

<style scoped>

</style>