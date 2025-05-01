import { fsPromises } from '../../../../../src/toolBox/base/deps/node/fs.js';
import { JSZip } from '../../../../../src/toolBox/base/deps/npm/jszip.js';

export default class D5MLoader {
    constructor() {
    }

    async generateThumbnail(path) {
        try {
            const data = await fsPromises.readFile(path);
            const zip = await JSZip.loadAsync(data);

            const iconFile = zip.file('icon.png');
            if (!iconFile) {
                throw new Error('No icon.png found in the d5m file.');
            }

            const thumbnailData = await iconFile.async('nodebuffer');

            return {
                type: 'png',
                data: thumbnailData
            };
        } catch (e) {
            console.log(e);
            throw new Error('Failed to generate thumbnail: ' + e.message);
        }
    }

    match(path) {
        return /\.(d5m)$/i
    }
    sys = ['win32 x64']

}