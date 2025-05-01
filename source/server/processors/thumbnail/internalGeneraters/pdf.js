import { PDFDocument } from '../../../../../../src/toolBox/base/deps/npm/pdf-lib.js';
import { pdf2pic } from '../../../../../../src/toolBox/base/deps/npm/pdf2pic.js';
import { fsPromises } from '../../../../../../src/toolBox/base/deps/node/fs.js';

async function handlePdfFile(imagePath, req, res) {
    const cacheKey = generateCacheKey(imagePath);
    if (await serveFromCache(cacheKey, res)) return;
    try {
        const pdfBuffer = await fsPromises.readFile(imagePath.replace(/\\/g, '/'));
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const [firstPage] = await pdfDoc.getPages();
        const { width, height } = await firstPage.getSize()
        const options = {
            density: 330,
            width,
            height,
            savePath: 'D:/temp/sac'
        }
        const data = await pdf2pic.fromBuffer(pdfBuffer, options).bulk([1, 2, 3, 4, 5, 6, 7, 8], { responseType: 'buffer' })
        sharp(data[0].buffer)
            .resize(512, 512, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toBuffer()
            .then(buffer => {
                cache[cacheKey] = images[0]
                res.type('jpeg').send(buffer);
            })
            .catch(err => {
                throw (err)
            });
    } catch (err) {
        console.error(err, err.stack)
        throw (err)
    }
}
// Updated handleImageFile function with cache check and save
/*async function handleImageFile(imagePath, req, res) {
    const cacheKey = generateCacheKey(imagePath);
    //if (await serveFromCache(cacheKey, res)) return;
    if (!imagePath.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        // Handle non-image files
        const encodedPath = Buffer.from(imagePath).toString('base64');
        let fn = (callback, force) => {
            return (error, result) => {
                try {
                    if (error) {
                        force && res.status(500).send('Error extracting icon: ' + error.message);
                        callback && callback()
                        return;
                    }
                    try {
                        const iconBuffer = Buffer.from(result, 'base64');
                        saveToCache(cacheKey, iconBuffer);
                        cache[cacheKey] = iconBuffer

                        res.type('png').send(iconBuffer);
                    } catch (error) {

                        force && res.status(500).send('Error extracting icon: ' + error.message);
                        callback && callback()
                        return
                    }
                } catch (e) {

                    console.warn(e)
                    return
                }
            }
        }
        getBase64Thumbnail(encodedPath, fn(() => getLargeIcon(encodedPath, fn('', true))));
    } else {
        // Existing image handling code
        fs.readFile(imagePath, (err, data) => {
            if (err) {
                res.status(404).send(`File not found ${req.query.path}`);
                return;
            }
            sharp(data)
                .resize(512, 512, {
                    fit: 'inside',
                    withoutEnlargement: true // 防止放大图像
                })
                .toBuffer()
                .then(buffer => {
                    cache[cacheKey] = buffer

                    saveToCache(cacheKey, buffer);
                    res.type('jpeg').send(buffer);
                })
                .catch(err => {
                    res.status(500).send('Error processing image: ' + err.message);
                });
        });
    }
}*/
