import { IconButton } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import withStyles from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField";
import EditIcon from "@material-ui/icons/Edit";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import { gql } from "apollo-boost";
import Axios from "axios";
import React, { useContext, useState } from "react";
import { Mutation } from "react-apollo";
import { UserContext } from "../../Root";
import Error from "../Shared/Error";

const UpdateTrack = ({ classes, track }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    title: track.title,
    description: track.description,
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");
  const currentUser = useContext(UserContext);
  const isCurrentUser = currentUser.id === track.postedBy.id;

  console.log(isCurrentUser);

  const handleChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const handleChangeFile = (e) => {
    const fileSizeLimit = 10000000;
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > fileSizeLimit) {
      setFileError("File is too large. Upload a file of maximum 10 MB.");
      return;
    }
    setFile(selectedFile);
    setFileError("");
  };

  const handleAudioUpload = async () => {
    const data = new FormData();
    data.append("file", file);
    data.append("resource_type", "raw");
    data.append("upload_preset", "tracks");
    data.append("cloud_name", "dxutn0n5i");
    try {
      const res = await Axios.post(
        "https://api.cloudinary.com/v1_1/dxutn0n5i/raw/upload",
        data
      );
      return res.data.url;
    } catch (err) {
      console.error("Error on creating track", err);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e, updateTrack) => {
    setSubmitting(true);
    e.preventDefault();
    // Upload audio file and get returned url from api
    const uploadedUrl = await handleAudioUpload();
    updateTrack({
      variables: { ...data, url: uploadedUrl, trackId: parseInt(track.id) },
    });
  };

  return (
    isCurrentUser && (
      <>
        <IconButton>
          <EditIcon onClick={() => setOpen(true)} />
        </IconButton>

        <Mutation
          mutation={UPDATE_TRACK_MUTATION}
          onCompleted={() => {
            console.log({ data });
            setSubmitting(false);
            setOpen(false);
            setData({ title: "", description: "" });
          }}
          // refetchQueries={() => [{ query: GET_TRACKS_QUERY }]}
        >
          {(updateTrack, { loading, error }) => {
            if (error) return <Error error={error} />;

            return (
              <Dialog className={classes.dialog} open={open}>
                <form onSubmit={(e) => handleSubmit(e, updateTrack)}>
                  <DialogTitle>Create Track</DialogTitle>
                  <DialogContent>
                    <DialogContentText>Update track</DialogContentText>
                    <FormControl fullWidth>
                      <TextField
                        label="Title"
                        id="title"
                        value={data.title}
                        placeholder="Add title"
                        onChange={handleChange}
                        className={classes.textField}
                      />
                    </FormControl>
                    <FormControl fullWidth>
                      <TextField
                        multiline
                        rows="2"
                        id="description"
                        label="Description"
                        value={data.description}
                        onChange={handleChange}
                        placeholder="Add description"
                        className={classes.textField}
                      />
                    </FormControl>
                    <FormControl error={!!fileError}>
                      <input
                        accept="audio/*"
                        required
                        id="audio"
                        type="file"
                        className={classes.input}
                        onChange={handleChangeFile}
                      />
                      <label htmlFor="audio">
                        <Button
                          variant="outlined"
                          color={file ? "secondary" : "inherit"}
                          component="span"
                          className={classes.button}
                        >
                          Audio File
                          <LibraryMusicIcon className={classes.icon} />
                        </Button>
                        {file && file.name}
                      </label>
                      <FormHelperText>{fileError}</FormHelperText>
                    </FormControl>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => setOpen(false)}
                      className={classes.cancel}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={classes.save}
                      type="submit"
                      disabled={
                        !data.title.trim() ||
                        !data.description.trim() ||
                        submitting
                      }
                    >
                      {submitting ? (
                        <CircularProgress className={classes.save} size={24} />
                      ) : (
                        "Update Track"
                      )}
                    </Button>
                  </DialogActions>
                </form>
              </Dialog>
            );
          }}
        </Mutation>
      </>
    )
  );
};

const UPDATE_TRACK_MUTATION = gql`
  mutation (
    $trackId: Int!
    $title: String
    $description: String
    $url: String
  ) {
    updateTrack(
      trackId: $trackId
      title: $title
      description: $description
      url: $url
    ) {
      track {
        id
        title
        description
        url
        likes {
          id
        }
        postedBy {
          id
          username
        }
      }
    }
  }
`;

const styles = (theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550,
  },
  textField: {
    margin: theme.spacing.unit,
  },
  cancel: {
    color: "red",
  },
  save: {
    color: "green",
  },
  button: {
    margin: theme.spacing.unit * 2,
  },
  icon: {
    marginLeft: theme.spacing.unit,
  },
  input: {
    display: "none",
  },
});

export default withStyles(styles)(UpdateTrack);
