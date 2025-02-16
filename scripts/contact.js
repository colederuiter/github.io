"use strict";

/**
 * Represents a Contact with a name, contact number and email address
 */
(function (core) {
    class Contact {

        /**
         * Constructs a new Contact instance
         * @param fullName
         * @param contactNumber
         * @param emailAddress
         */
        constructor(fullName = "", contactNumber = "", emailAddress = "") {
            this._fullName = fullName;
            this._contactNumber = contactNumber;
            this._emailAddress = emailAddress;
        }

        /**
         * Get the full name of the contact
         * @returns {string}
         */
        get fullName() {
            return this._fullName;
        }

        /**
         * Set the full name of the contact. Validates the input to ensure its non-empty string
         * @param fullName
         */
        set fullName(fullName) {
            if (typeof fullName !== "string" || fullName.trim() === "") {
                throw new Error("Invaild fullName: must be a non-empty string");
            }
            this._fullName = fullName;
        }

        /**
         * Gets the contactNumber for the Contact
         * @returns {string}
         */
        get contactNumber() {
            return this._contactNumber;
        }

        /**
         * Sets the phone number of the contact. Validates the input to ensure it matches a 10-digit number format
         * @param contactNumber
         */
        set contactNumber(contactNumber) {
            const phoneRegex = /^\d{3}-\d{3}-\d{4}$/; //123-456-8888
            if (!phoneRegex.test(contactNumber)) {
                throw new Error("Invalid contactNumber: must be a 10 digit number");
            }
            this._contactNumber = contactNumber;
        }

        /**
         * get the email address for the contact
         * @returns {string}
         */
        get emailAddress() {
            return this._emailAddress;
        }

        /**
         * Sets the emailAddress of the contact. Validates the input to make sure it is a valid email address
         * @param emailAddress
         */
        set emailAddress(emailAddress) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailAddress)) {
                throw new Error("Invalid emailAddress: must be a valid email address");
            }
            this._emailAddress = emailAddress;
        }

        /**
         * Converts the contact details into a human-readable string
         * @returns {string}
         */
        toString() {
            return `Full Name: ${this._fullName},\n
                Contact Number: ${this.contactNumber},\n
                Email Address: ${this.emailAddress}`;
        }

        /**
         * Serializes the contact details into a string format suitable for storage
         * @returns {string|null}
         */
        serialize() {
            if (!this._fullName || !this._contactNumber || !this._emailAddress) {
                console.error("One or more Contact Properties are missing or invalid");
                return null;
            }
            return `${this._fullName},${this._contactNumber},${this._emailAddress}`;
        }

        /**
         * Deserializes a (csv) string of contact details and updates the contact properties
         * @param data
         * @returns {null}
         */
        deserialize(data) {
            if (typeof data !== "string" || data.split(",").length !== 3) {
                console.error("Invalid data format for deserialization");
                return null;
            }

            const propertyArray = data.split(",");
            this._fullName = propertyArray[0];
            this._contactNumber = propertyArray[1];
            this._emailAddress = propertyArray[2];
        }
    }

    core.Contact = Contact;
})(core||(core = {}));