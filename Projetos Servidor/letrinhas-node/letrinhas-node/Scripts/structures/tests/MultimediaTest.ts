﻿import Test = require('Test');

class MultimediaTest extends Test {
    questionContent: string;
    contentIsUrl: boolean;

    option1: string;
    option1IsUrl: boolean;

    option2: string;
    option2IsUrl: boolean;

    option3: string;

    /**
     * Must be 1, 2, or 3
     */
    option3IsUrl: boolean;

    correctOption: number;
}
export = MultimediaTest;