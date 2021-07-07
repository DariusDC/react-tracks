import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

const LikeTrack = ({ classes, trackId, likeCount }) => {
  return (
    <Mutation
      onCompleted={(data) => console.log({ data })}
      variables={{ trackId: parseInt(trackId) }}
      mutation={CREATE_LIKE_MUTATION}
    >
      {(createLike) => (
        <IconButton
          className={classes.iconButton}
          onClick={(e) => {
            e.stopPropagation();
            createLike();
          }}
        >
          {likeCount}
          <ThumbUpIcon className={classes.icon} />
        </IconButton>
      )}
    </Mutation>
  );
};

const CREATE_LIKE_MUTATION = gql`
  mutation ($trackId: Int!) {
    createLike(trackId: $trackId) {
      track {
        id
        likes {
          id
        }
      }
    }
  }
`;

const styles = (theme) => ({
  iconButton: {
    color: "deeppink",
  },
  icon: {
    marginLeft: theme.spacing.unit / 2,
  },
});

export default withStyles(styles)(LikeTrack);
