<template>
    <button @click="onClick()" 
            class="svg-button" 
            v-bind:class="{toggled: this.toggled, disabled: !isEnabled}">

        <svg v-bind:style="{width: width, height: height}">
            <path v-bind:fill="fill" v-bind:d="d"/>
        </svg>

    </button>
</template>

<script>
export default {
    name: 'svg-button',
    props: {
        buttonId: "",
        width: "1em",
        height: "1em",
        isTogglable: false,
        d: "",
        fill: "#000000",
        isEnabled: true
    },
    data: {
        toggled: false
    },
    methods: {
        onClick: function() {
            if(!(this.isEnabled))
                return;

            if(isTogglable)
            {
                this.toggled = !this.toggled;

                if(this.toggled)
                    this.$emit("buttonEnabled", this.buttonId);
                else
                    this.$emit("buttonDisabled", this.buttonId);

                this.$emit("buttongToggled", this.buttonId);

            } else {
                this.$emit("buttonClick", this.buttonId);
            }
        }
    }
}
</script>
