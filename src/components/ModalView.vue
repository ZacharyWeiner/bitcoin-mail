<template>
    <div class="modal">
        <div class="overlay" ></div>
        <div class="modal-card" >
            <button style='float:right' @click="emit( 'closeModal')"> X </button>
            <slot />
        </div>
    </div>
</template>
<script>
import useKeydown from '../composables/use-keydown';
export default {
    setup(props, {emit}){
        useKeydown([
            {key: 'Escape', fn: () => { emit( 'closeModal') } }
        ])
        return {
            emit
        }
    }
}
</script>
<style scoped>

</style>