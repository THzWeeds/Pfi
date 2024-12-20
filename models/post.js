import Model from './model.js';

export default class Post extends Model {
    constructor() {
        super(true /* secured Id */);

        this.addField('Title', 'string');
        this.addField('Text', 'string');
        this.addField('Category', 'string');
        this.addField('Image', 'asset');
        this.addField('Date', 'integer');
        this.addField('Likes','integer');
        this.addField('LikedUsers','string');
        this.addField('LikedUsersName','string');
        this.setKey("Title");
    }
}