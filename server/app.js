import path from 'path';
import bodyParser from 'body-parser';
import express from 'express';
import passport from 'passport';
import recipes from './routes/recipes';
import local from './routes/auth/local';
import social from './routes/auth/social';
import seeds from './db/seeds';

seeds();
const staticFiles = express.static(path.join(__dirname, '../../client/build'));

const app = express();
app.use(staticFiles);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/recipes', recipes);
app.use('/auth', local);
app.use('/auth/social', social);
app.use(passport.initialize());
app.use('/*', staticFiles);
app.use((req, res, next) => {
  const err = new Error('error...');
  err.status = 404;
  next(err);
});

app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  console.log(err);
});
app.set('port', (process.env.PORT || 3001));
app.listen(app.get('port'), () => {
  console.log(`Listening on ${app.get('port')}`);
});

