variable "aws_region" {
  type        = string
  default     = "ap-southeast-2"
  description = "Regiao da AWS (Sydney - permitida pela Organization)"
}

variable "availability_zone" {
  type        = string
  default     = "ap-southeast-2a"
  description = "Zona de Disponibilidade com suporte a mac2-m2"
}

variable "vpc_id" {
  type        = string
  default     = "vpc-0ce0d8a1ecadfba86"
  description = "VPC padrao"
}

variable "subnet_id" {
  type        = string
  default     = "subnet-06f962e4e5fe39e86"
  description = "Subnet publica em ap-southeast-2a"
}

variable "key_name" {
  type        = string
  default     = "Ios-key"
  description = "Par de chaves SSH"
}

variable "ami_id" {
  type        = string
  default     = "ami-01cb46e8cbea6e71e"
  description = "macOS Sonoma arm64 oficial da AWS"
}

variable "mac_password" {
  type        = string
  default     = "DaigIos2026!MacBuild"
  sensitive   = true
  description = "Senha do usuario ec2-user"
}

variable "allowed_ssh_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "CIDR liberado para SSH efêmero — troque para SEU_IP/32 antes do build"
}
