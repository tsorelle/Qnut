namespace Peanut {

    export class NameParser {
        /**
         * Parses a name for sorting purposes: lowercases, strips titles etc. and returns '(last-name),(remainder of name)'
         * Example:
         *      Peanut.NameParser.getFileAsName('Dr Terry L. SoRelle III, MD');
         *      returns 'sorelle,terry l.
         *
         * @param fullName
         * @returns {string}
         */
        public static getFileAsName(fullName: any) {
            if (typeof fullName !== 'string') {
                return <string>'';
            }
            let name : string = fullName ? fullName.trim().toLowerCase() : '';
            if (name.length == 0) {
                return name;
            }
            let last: string = '';
            let parts = name.split(' ');

            while (parts.length > 0) {
                let part = <string>parts.pop();
                if (!NameParser.isEndTitle(part)) {
                    if (part.substr(part.length - 1) === ',') {
                        part = part.substr(0, part.length - 1).trim();
                    }
                    last = part;
                    break;
                }
            }

            if (last) {
                while (parts.length > 0) {
                    let part = parts.shift();
                    if (NameParser.isTitle(part)) {
                        if (parts.length === 0) {
                            return last;
                        }
                    }
                    else {
                        return last + ',' + part + ' ' + parts.join(' ');
                    }
                }
            }

            return name;
        }

        private static isTitle(word: string) {
            if (word.substr(word.length - 1) === '.') {//  (word.endsWith('.')) {
                word = word.substr(0, word.length - 1).trim();
            }
            switch (word) {
                case 'mr' :
                    return true;
                case 'mrs' :
                    return true;
                case 'ms' :
                    return true;
                case 'dr' :
                    return true;
                case 'fr' :
                    return true;
                case 'sr' :
                    return true;
            }

            return false;
        }

        private static isEndTitle(word: string) {
            if ((word.substr(word.length - 1) === '.') || (word.substr(word.length - 1) === ',')) {
                word = word.substr(0, word.length - 1).trim();
            }
            switch (word) {
                case 'jr' :
                    return true;
                case 'sr' :
                    return true;
                case 'ii' :
                    return true;
                case 'iii' :
                    return true;
                case 'md' :
                    return true;
                case 'm.d' :
                    return true;
                case 'phd' :
                    return true;
                case 'ph.d' :
                    return true;
                case 'd.d' :
                    return true;
                case 'dd' :
                    return true;
                case 'dds' :
                    return true;
                case 'dd.s' :
                    return true;
                case 'atty' :
                    return true;
            }
            return false;
        }
    }
}