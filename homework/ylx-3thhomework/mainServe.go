package main

import (
	"context"
	"fmt"
	pb "grpcstudy1/Server/proto"
	"net"

	"google.golang.org/grpc"
)

type server struct{ pb.UnimplementedPostUserServer }

func (s *server) GetUser(ctx context.Context, req *pb.PostUserReq) (*pb.PostUserRes, error) {
	return &pb.PostUserRes{User: req.User, Password: req.Password}, nil
}

func main() {
	listen, err := net.Listen("tcp", ":9090")
	if err != nil {
		fmt.Println("Failed1")
		return
	}

	grpcServer := grpc.NewServer()

	pb.RegisterPostUserServer(grpcServer, &server{})

	if err := grpcServer.Serve(listen); err != nil {
		fmt.Println("Failed2")
		return
	}

}
