//About isbn validation:
//https://en.wikipedia.org/wiki/International_Standard_Book_Number#ISBN-13_check_digit_calculation
export class ISBN {
    constructor(isbn) {
        this._isbn = isbn
        this._isbnDigits = null
        this._isValid = false
        this.isChecksumValid = false
        //aviable isbn formats, based by digits lenght
        this._is10 = false
        this._is13 = false

        //process
        this._init()
        this._invalid()
        this.isChecksumValid = this._isChecksumValid()
    }

    _init() {
        //remove any non-digit char
        this._isbnDigits = parseInt(this._isbn.replace(/[^\d]/g, ''), 10).toString()
    }

    _invalid() {
        if(this._isbnDigits.length === 10)
            this._is10 = true
        else if(this._isbnDigits.length === 13)
            this._is13 = true

        this._isValid = is10 || is13
    }

    _isChecksumValid() {
        if(!(this.isValid()))
            return false

        let checkDigit = -1
        let checksumDigit = 0

        if(this._is13) {
            checkDigit = this._isbnDigits[this._isbnDigits.length - 1]
            chechsumDigit = ISBN._checksumIsbn13(this._isbnDigits)
        } else if(this._is10) {
            //TODO : ibsn-10 checksum validation &
            //     : conversion to isbn-13 if valid
            //     > checkDigit = this._isbnDigits[this._isbnDigits.length - 1]
            //     > chechsumDigit = ISBN._checksumIsbn10(this._isbnDigits)
        }

        // noinspection EqualityComparisonWithCoercionJS
        if(checkDigit == checksumDigit)
            this._isValid = true
    }

    static _checksumIsbn13(isbn13) {
        if(isbn13.length < 12)
            throw new Error(`invalid isbn-13 format: ${isbn13}`)

        let sum = 0

        //'i < 13' -> becouse we don't want sum last/unknown check digit
        for(let i = 0; i < 13; i++) {
            const weight = (i % 2 !== 0) ? 1 : 3

            sum += weight * parseInt(isbn13[i], 10)
        }

        const rem = sum % 10
        return 10 - rem
    }

    //TODO:
    static _checksumIsbn10(isbn10) {
        throw new Error(`not implemented yet`)
    }

    isValid() {
        return this._isValid
    }

    format() {
        if(this._is10)
            return 'isbn-10'
        else if(this._is13)
            return 'isbn-13'
        else
            return 'invalid'
    }

    //TODO : implement as10()
    //     > as10() {...}

    as13(_throw = true) {
        //TODO: add support for isbn-10
        if(this.isValid() && this._is13) {
            return this._isbnDigits
        } else {
            if(_throw)
                throw new Error(`isbn is invalid or has wrong format: ${this._isbnDigits}`)

            return 'unknown'
        }
    }

    isChecksumCorrect() {
        return this.isChecksumValid
    }
}
