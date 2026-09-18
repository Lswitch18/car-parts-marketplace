output "mac_public_ip" {
  value       = aws_instance.mac_builder.public_ip
  description = "IPv4 Publico do Mac mini"
}

output "ssh_command_key" {
  value       = "ssh -i /home/lswitch/car-parts-marketplce/Ios-key.pem ec2-user@${aws_instance.mac_builder.public_ip}"
  description = "Comando para conectar via chave SSH"
}

output "ssh_command_password" {
  value       = "ssh ec2-user@${aws_instance.mac_builder.public_ip}"
  description = "Comando para conectar via senha"
}

output "vnc_url" {
  value       = "vnc://${aws_instance.mac_builder.public_ip}:5900"
  description = "URL VNC (desativado no modo efêmero — SG sem 5900)"
}
