import React from 'react';
import { makeStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

const useStyles = makeStyles(theme => ({
  card: {
    display: 'flex', borderRadius: "19px",backgroundColor:'red'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 151,
  }

}));

export default function MediaControlCard(props) {
  const classes = useStyles();

  return (
    <Card style={props.crdStyle}>
      <CardMedia
        className={classes.cover}
        image={props.image}
        title="Live from space album cover"
      />
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography variant="h6">
            {props.title}
          </Typography>
          <Typography variant="h5" color="textSecondary">
            {props.children}
          </Typography>
        </CardContent>
      </div>
    </Card>
  );
}
