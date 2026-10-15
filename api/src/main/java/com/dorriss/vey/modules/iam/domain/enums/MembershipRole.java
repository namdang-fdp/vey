package com.dorriss.vey.modules.iam.domain.enums;

/** Role thuộc từng workspace; không có quan hệ kế thừa quyền ngầm giữa các giá trị. */
public enum MembershipRole {
  OWNER,
  ADMIN,
  MEMBER,
  GUEST
}
