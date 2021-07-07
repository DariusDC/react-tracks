import React from "react";
import IconButton from "@material-ui/core/IconButton";
import TrashIcon from "@material-ui/icons/DeleteForeverOutlined";
import { UserContext } from "../../Root";
import { useContext } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { GET_TRACKS_QUERY } from "../../pages/App";

const DeleteTrack = ({ track }) => {
  const currentUser = useContext(UserContext);
  const isCurrentUser = currentUser.id === track.postedBy.id;

  const handleDeleteCache = (cache, { data: { deleteTrack } }) => {
    const data = cache.readQuery({ query: GET_TRACKS_QUERY });
    const tracks = data.tracks.filter(
      (track) => Number(track.id) !== deleteTrack.trackId
    );
    cache.writeQuery({ query: GET_TRACKS_QUERY, data: { tracks } });
  };

  return (
    isCurrentUser && (
      <Mutation
        mutation={DELETE_TRACK_MUTATION}
        variables={{ trackId: parseInt(track.id) }}
        onCompleted={(data) => {
          console.log({ data });
        }}
        update={handleDeleteCache}
        // refetchQueries={() => [{ query: GET_TRACKS_QUERY }]}
      >
        {(deleteTrack) => {
          return (
            <IconButton onClick={deleteTrack}>
              <TrashIcon />
            </IconButton>
          );
        }}
      </Mutation>
    )
  );
};

const DELETE_TRACK_MUTATION = gql`
  mutation ($trackId: Int!) {
    deleteTrack(trackId: $trackId) {
      trackId
    }
  }
`;

export default DeleteTrack;
