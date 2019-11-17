class Author {
    name: String;
    name_lower: String;

    constructor(name: String) {
        this.name = name;
        this.name_lower = name.toLowerCase();
    }
}

export default Author;