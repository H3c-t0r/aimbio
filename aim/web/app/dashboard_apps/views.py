from flask import Blueprint, jsonify, request, make_response
from flask_restful import Api, Resource

from aim.web.app.dashboard_apps.models import ExploreState
from aim.web.app.dashboard_apps.serializers import ExploreStateModelSerializer, explore_state_response_serializer
from aim.web.app.db import db
from aim.web.app.utils import ValidationError

dashboard_apps_bp = Blueprint('dashboard_apps', __name__)
dashboard_apps_api = Api(dashboard_apps_bp)


@dashboard_apps_api.resource('/')
class DashboardAppsListCreateApi(Resource):
    def get(self):
        explore_states = ExploreState.query.filter(ExploreState.is_archived == False)
        result = []
        for es in explore_states:
            result.append(explore_state_response_serializer(es))
        return make_response(jsonify(result), 200)

    def post(self):
        explore_state = ExploreState()
        serializer = ExploreStateModelSerializer(model_instance=explore_state, json_data=request.form)
        try:
            serializer.validate(raise_exception=True)
        except ValidationError as e:
            return make_response(jsonify(e), 403)
        explore_state = serializer.save()
        db.session.add(explore_state)
        db.session.commit(explore_state)
        return make_response(jsonify(explore_state_response_serializer(explore_state)), 201)


@dashboard_apps_api.resource('/<app_id>')
class DashboardAppsGetUpdateDeleteApi(Resource):
    def get(self, app_id):
        explore_state = ExploreState.query.filter(ExploreState.uuid == app_id).first()
        if not explore_state:
            return make_response(jsonify({}), 404)

        return make_response(jsonify(explore_state_response_serializer(explore_state)), 200)

    def update(self, app_id):
        explore_state = ExploreState.query.filter(ExploreState.uuid == app_id).first()
        if not explore_state:
            return make_response(jsonify({}), 404)

        serializer = ExploreStateModelSerializer(model_instance=explore_state, json_data=request.form)
        try:
            serializer.validate()
        except ValidationError as e:
            return make_response(jsonify(e))
        explore_state = serializer.save()
        db.session.commit()

        return make_response(jsonify(explore_state_response_serializer(explore_state)), 200)

    def delete(self, app_id):
        explore_state = ExploreState.query.filter(ExploreState.uuid == app_id).first()
        if not explore_state:
            return make_response(jsonify({}), 404)

        explore_state.is_archived = True
        db.session.commit()

        return make_response(jsonify({}), 200)
