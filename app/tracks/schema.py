
import graphene
from graphene.utils.props import props
from graphene_django import DjangoObjectType
from .models import Track, Like
from users.schema import UserType
from graphql import GraphQLError
from django.db.models import Q

class TrackType(DjangoObjectType):
    class Meta:
        model = Track

class LikeType(DjangoObjectType):
    class Meta:
        model = Like

class Query(graphene.ObjectType):
    tracks = graphene.List(TrackType, search=graphene.String())
    likes = graphene.List(LikeType)

    def resolve_tracks(self, info, search=None):
        filter = (
            Q(title__icontains=search) |
            Q(description__icontains=search) | 
            Q(url__icontains=search) | 
            Q(posted_by__username__icontains=search)
         )

        if search:
            return Track.objects.filter(filter)    
        
        return Track.objects.all()

    def resolve_likes(self, info):
        return Like.objects.all()

class CreateTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        title = graphene.String()
        description = graphene.String()
        url = graphene.String()

    def mutate(self, info, title, description, url):
        user = info.context.user

        if user.is_anonymous:
            raise GraphQLError("Log in to add a track")

        track = Track(title=title, description=description, url=url, posted_by=user)
        track.save()
        return CreateTrack(track=track)

class UpdateTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        title = graphene.String()
        description = graphene.String()
        url = graphene.String()
        track_id = graphene.Int(required=True)

    def mutate(self, info, track_id, title, description, url):
        user = info.context.user
        track = Track.objects.get(id=track_id)

        if track.posted_by != user:
            raise GraphQLError("You can't update this track")

        track.title = title or track.title
        track.description = description or track.description
        track.url = url or track.url

        track.save()
        return UpdateTrack(track=track)


class DeleteTrack(graphene.Mutation):
    track_id = graphene.Int()

    class Arguments:
        track_id = graphene.Int(required=True)

    def mutate(self, info, track_id):
        user = info.context.user
        track = Track.objects.get(id=track_id)

        if track.posted_by and track.posted_by != user:
            raise GraphQLError("You can't delete this track")

        track.delete()
        return DeleteTrack(track_id=track_id)

class CreateLike(graphene.Mutation):
    user = graphene.Field(UserType)
    track = graphene.Field(TrackType)

    class Arguments:
        track_id = graphene.Int(required=True)

    def mutate(self, info, track_id):
        user = info.context.user

        if user.is_anonymous:
            raise GraphQLError("Log in first in order to like tracks")

        track = Track.objects.get(id=track_id)
        if not track:
            raise GraphQLError("Cannot find the given track")

        Like.objects.create(user=user, track=track)
        return CreateLike(user=user, track=track)

class Mutation(graphene.ObjectType):
    create_track = CreateTrack.Field()
    update_track = UpdateTrack.Field()
    delete_track = DeleteTrack.Field()
    create_like = CreateLike.Field()