package main

import (
	"context"
	"fmt"
	pb "grpcstudy1/Server/proto"
	"log"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	conn, err := grpc.Dial("localhost:9090", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		fmt.Println("Fail")
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()

	client := pb.NewPostUserClient(conn)

	resp, _ := client.GetUser(context.Background(), &pb.PostUserReq{User: "a", Password: "123"})
	fmt.Println(resp.User,resp.Password)
}
