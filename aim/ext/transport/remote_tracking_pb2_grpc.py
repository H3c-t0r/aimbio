# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
# temporary workaround for M1 build
try:
    import grpc
except ImportError:
    grpc = None

import aim.ext.transport.remote_tracking_pb2 as remote__tracking__pb2


class RemoteTrackingServiceStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.health_check = channel.unary_unary(
                '/RemoteTrackingService/health_check',
                request_serializer=remote__tracking__pb2.HealthCheckRequest.SerializeToString,
                response_deserializer=remote__tracking__pb2.HealthCheckResponse.FromString,
                )
        self.get_version = channel.unary_unary(
                '/RemoteTrackingService/get_version',
                request_serializer=remote__tracking__pb2.VersionRequest.SerializeToString,
                response_deserializer=remote__tracking__pb2.VersionResponse.FromString,
                )
        self.get_resource = channel.unary_unary(
                '/RemoteTrackingService/get_resource',
                request_serializer=remote__tracking__pb2.ResourceRequest.SerializeToString,
                response_deserializer=remote__tracking__pb2.ResourceResponse.FromString,
                )
        self.release_resource = channel.unary_unary(
                '/RemoteTrackingService/release_resource',
                request_serializer=remote__tracking__pb2.ReleaseResourceRequest.SerializeToString,
                response_deserializer=remote__tracking__pb2.ReleaseResourceResponse.FromString,
                )
        self.run_instruction = channel.stream_stream(
                '/RemoteTrackingService/run_instruction',
                request_serializer=remote__tracking__pb2.InstructionRequest.SerializeToString,
                response_deserializer=remote__tracking__pb2.InstructionResponse.FromString,
                )
        self.run_write_instructions = channel.stream_unary(
                '/RemoteTrackingService/run_write_instructions',
                request_serializer=remote__tracking__pb2.WriteInstructionsRequest.SerializeToString,
                response_deserializer=remote__tracking__pb2.WriteInstructionsResponse.FromString,
                )


class RemoteTrackingServiceServicer(object):
    """Missing associated documentation comment in .proto file."""

    def health_check(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def get_version(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def get_resource(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def release_resource(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def run_instruction(self, request_iterator, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def run_write_instructions(self, request_iterator, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_RemoteTrackingServiceServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'health_check': grpc.unary_unary_rpc_method_handler(
                    servicer.health_check,
                    request_deserializer=remote__tracking__pb2.HealthCheckRequest.FromString,
                    response_serializer=remote__tracking__pb2.HealthCheckResponse.SerializeToString,
            ),
            'get_version': grpc.unary_unary_rpc_method_handler(
                    servicer.get_version,
                    request_deserializer=remote__tracking__pb2.VersionRequest.FromString,
                    response_serializer=remote__tracking__pb2.VersionResponse.SerializeToString,
            ),
            'get_resource': grpc.unary_unary_rpc_method_handler(
                    servicer.get_resource,
                    request_deserializer=remote__tracking__pb2.ResourceRequest.FromString,
                    response_serializer=remote__tracking__pb2.ResourceResponse.SerializeToString,
            ),
            'release_resource': grpc.unary_unary_rpc_method_handler(
                    servicer.release_resource,
                    request_deserializer=remote__tracking__pb2.ReleaseResourceRequest.FromString,
                    response_serializer=remote__tracking__pb2.ReleaseResourceResponse.SerializeToString,
            ),
            'run_instruction': grpc.stream_stream_rpc_method_handler(
                    servicer.run_instruction,
                    request_deserializer=remote__tracking__pb2.InstructionRequest.FromString,
                    response_serializer=remote__tracking__pb2.InstructionResponse.SerializeToString,
            ),
            'run_write_instructions': grpc.stream_unary_rpc_method_handler(
                    servicer.run_write_instructions,
                    request_deserializer=remote__tracking__pb2.WriteInstructionsRequest.FromString,
                    response_serializer=remote__tracking__pb2.WriteInstructionsResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'RemoteTrackingService', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))


 # This class is part of an EXPERIMENTAL API.
class RemoteTrackingService(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def health_check(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/RemoteTrackingService/health_check',
            remote__tracking__pb2.HealthCheckRequest.SerializeToString,
            remote__tracking__pb2.HealthCheckResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)

    @staticmethod
    def get_version(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/RemoteTrackingService/get_version',
            remote__tracking__pb2.VersionRequest.SerializeToString,
            remote__tracking__pb2.VersionResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)

    @staticmethod
    def get_resource(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/RemoteTrackingService/get_resource',
            remote__tracking__pb2.ResourceRequest.SerializeToString,
            remote__tracking__pb2.ResourceResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)

    @staticmethod
    def release_resource(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/RemoteTrackingService/release_resource',
            remote__tracking__pb2.ReleaseResourceRequest.SerializeToString,
            remote__tracking__pb2.ReleaseResourceResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)

    @staticmethod
    def run_instruction(request_iterator,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.stream_stream(request_iterator, target, '/RemoteTrackingService/run_instruction',
            remote__tracking__pb2.InstructionRequest.SerializeToString,
            remote__tracking__pb2.InstructionResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)

    @staticmethod
    def run_write_instructions(request_iterator,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.stream_unary(request_iterator, target, '/RemoteTrackingService/run_write_instructions',
            remote__tracking__pb2.WriteInstructionsRequest.SerializeToString,
            remote__tracking__pb2.WriteInstructionsResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)
