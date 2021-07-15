const { createReadStream, promises } = require("fs");
const express = require('express');
const { resolve } = require("path");

//## DEFAULT VALUES
const path = resolve(__dirname, '../express/videos/video.mp4');
const CHUNK_SIZE = 10 ** 5;
//## END DEFAULT VALUES

const app = express();

app.use(express.static(resolve(__dirname, '../public')));

app.get('/video', async (req, res) => {
  const { range } = req.headers;
  const { size } = await promises.stat(path);

  if (!range) {
    return res.status(400).send('Requires range header');
  }

  const
    start = Number((range || '').replace(/bytes=/, '').split('-')[0]),
    end = Math.min(start + CHUNK_SIZE, size - 1);

  const headers = {
    'Accept-Ranges': 'bytes',
    'Content-Range': `bytes ${start}-${end}/${size}`,
    'Content-Length': (end - start) + 1,
    'Content-Type': 'video/mp4'
  };

  res.writeHead(206, headers);

  const stream = createReadStream(path, { start, end });
  stream.on('open', () => stream.pipe(res))
    .on('close', err => res.end(err));
});

app.listen(3000, () => {
  console.log('LISTENING');
});
