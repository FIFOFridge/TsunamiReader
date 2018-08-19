export default function () {
    this.created = 0
    this.executing = 1
    this.done = 2

    //addational flags
    this.success = 4
    this.fail = 8
    this.exception = 16
}