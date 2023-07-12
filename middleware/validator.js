const Joi = require("joi");
const { min } = require("lodash");
const { ErrorHandler } = require("../helper");
const { statusCodes } = require("../helper");

const { BAD_GATEWAY } = statusCodes;

const schemas = {
	register_post: Joi.object({
		password: Joi.string().required(),
		type: Joi.string().required(),
		email: Joi.string()
			.email({ minDomainSegments: 2, tlds: { allow: ["com", "in"] } })
			.allow(null)
			.allow("")
			.required(),
		firstName: Joi.string().max(50).required().messages({
			"string.base": `First Name should be a 'text'`,
			"string.empty": `First Name cannot be an empty field`,
			"string.max": `First Name should have a max length of {#limit}`,
			"any.required": `First Name is a required field`,
		}),
		lastName: Joi.string().max(50).required().messages({
			"string.base": `Last Name should be a 'text'`,
			"string.empty": `Last Name cannot be an empty field`,
			"string.max": `Last Name should have a max length of {#limit}`,
			"any.required": `Last Name is a required field`,
		}),
		gender: Joi.string().max(30).required().messages({
			"string.base": `Gender should be a 'text'`,
			"string.empty": `Gender cannot be an empty field`,
			"string.max": `Gender should have a max length of {#limit}`,
			"any.required": `Gender is a required field`,
		}),
		dob: Joi.date().required(),
		phone: Joi.string().min(10).max(13).required().messages({
			"string.base": `Phone number should be a 'text'`,
			"string.empty": `Phone number cannot be an empty field`,
			"string.max": `Phone number should have a max length of {#limit}`,
			"string.min": `Phone number should have a min length of {#limit}`,
			"any.required": `Phone number is a required field`,
		}),
	}),

	register_send_otp_post: Joi.object({
		type: Joi.string().required(),
		phone: Joi.string().allow(null).allow("").required(),
		email: Joi.string().allow(null).allow("").required(),
	}),

	register_put: Joi.object({
		otp: Joi.number().max(999999).required(),
		type: Joi.string().required(),
		phone: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Phone must be a number`,
		}),
		email: Joi.string().allow(null).allow("").required().messages({
			"string.base": `Email should be a 'text'`,
		}),
	}),

	unit_post: Joi.object({
		unitStatus: Joi.string().required(),
		unitName: Joi.string().max(100).required().messages({
			"string.base": `Name should be a 'text'`,
			"string.empty": `Name cannot be an empty field`,
			"string.max": `Name should have a max length of {#limit}`,
			"any.required": `Name is a required field`,
		}),
		unitDescription: Joi.string().required().messages({
			"string.base": `Description should be a 'text'`,
			"string.empty": `Description cannot be an empty field`,
			"any.required": `Description is a required field`,
		}),
		mainActivity: Joi.string().required(),
		unitSector: Joi.string().required(),
		subSector: Joi.string().required(),
		isAncillary: Joi.string().required(),
		houseNumber: Joi.string(),
		plotNumber: Joi.string(),
		holdingNumber: Joi.string(),
		street: Joi.string(),
	}),

	caf_one_post: Joi.object({
		unitId: Joi.string().required(),
	}),

	caf_one_enterprise_profile_put: Joi.object({
		industryName: Joi.string().required(),
		aadhar: Joi.number().min(100000000000).max(999999999999).required().messages({
			"number.base": `Aadhar should be valid`,
			"number.empty": `Aadhar cannot be an empty field`,
			"number.max": `Aadhar cannot be more than 12 digits`,
			"number.min": `Aadhar cannot be less than 12 digits`,
			"any.required": `Aadhar is a required field`,
		}),
		orgType: Joi.string().required(),
		cin: Joi.string()
			.allow(null)
			.allow("")
			.regex(/^([L|U]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$/),
		cinDate: Joi.string().allow(null).allow(""),
		tan: Joi.string()
			.max(10)
			.min(10)
			.allow(null)
			.allow("")
			.regex(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/)
			.messages({
				"string.base": `Tan should be a 'text'`,
				"string.max": `Tan should have a max length of {#limit}`,
				"any.required": `Tan is a required field`,
			}),
		description: Joi.string().required().messages({
			"string.base": `Description should be a 'text'`,
			"string.empty": `Description cannot be an empty field`,
			"any.required": `Description is a required field`,
		}),
		dateOfInc: Joi.string().allow(null).allow(""),
		registrationNo: Joi.number().allow(null).allow("").messages({
			"string.base": `Registration Number should be a 'number'`,
			"any.required": `Registration Number is a required field`,
		}),
		registrationDate: Joi.string().allow(null).allow(""),
		pan: Joi.string()
			.max(10)
			.min(10)
			.regex(/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/)
			.required()
			.messages({
				"string.base": `PAN should be a 'text'`,
				"string.empty": `PAN cannot be an empty field`,
				"string.max": `PAN should have a max length of {#limit}`,
				"string.min": `PAN should have a min length of {#limit}`,
				"any.required": `PAN is a required field`,
			}),
		address: Joi.array(),
		// 	.items(
		// 	Joi.object({
		// 		// Object schema
		// 	})
		// ),
	}),

	caf_one_edit_enterprise_profile_put: Joi.object({
		generalDetailId: Joi.string().max(36).min(36).required(),
		industryName: Joi.string().required(),
		aadhar: Joi.number().min(100000000000).max(999999999999).required().messages({
			"number.base": `Aadhar should be valid`,
			"number.empty": `Aadhar cannot be an empty field`,
			"number.max": `Aadhar cannot be more than 12 digits`,
			"number.min": `Aadhar cannot be less than 12 digits`,
			"any.required": `Aadhar is a required field`,
		}),
		orgType: Joi.string().required(),
		cin: Joi.string()
			.allow(null)
			.allow("")
			.regex(/^([L|U]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$/),
		cinDate: Joi.string().allow(null).allow(""),
		tan: Joi.string()
			.max(10)
			.min(10)
			.allow(null)
			.allow("")
			.regex(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/)
			.messages({
				"string.base": `Tan should be a 'text'`,
				"string.max": `Tan should have a max length of {#limit}`,
				"any.required": `Tan is a required field`,
			}),
		description: Joi.string().required(),
		dateOfInc: Joi.string().allow(null).allow(""),
		registrationNo: Joi.number().allow(null).allow("").messages({
			"string.base": `Registration Number should be a 'number'`,
			"any.required": `Registration Number is a required field`,
		}),
		registrationDate: Joi.string().allow(null).allow(""),
		pan: Joi.string()
			.max(10)
			.min(10)
			.regex(/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/)
			.required(),
		address: Joi.array(),
	}),

	caf_one_enterprise_profile_post: Joi.object({
		generalDetailId: Joi.string().max(36).min(36).allow(null).allow(""),
		cafId: Joi.string().max(36).min(36).allow(null).allow(""),
	}),

	caf_one_stakeholder_put: Joi.object({
		generalDetailId: Joi.string().max(36).min(36).required(),
		stakeholder: Joi.array()
			.items(
				Joi.object().keys({
					name: Joi.string().required().messages({
						"string.base": `Name should be a 'string'`,
						"string.empty": `Name cannot be an empty field`,
						"any.required": `Name is a required field`,
					}),
					stakeholderType: Joi.string().required().messages({
						"string.base": `Stakeholder type should be a 'string'`,
						"string.empty": `Stakeholder type cannot be an empty field`,
						"any.required": `Stakeholder type is a required field`,
					}),
					totalEquity: Joi.number().min(0).required().messages({
						"number.base": `Total equity should be a 'number'`,
						"number.min": `Total equity should be greater than equal 0`,
						"number.empty": `Total equity cannot be an empty field`,
						"any.required": `Total equity is a required field`,
					}),
					equityParticipation: Joi.number().min(0).required().messages({
						"number.base": `Equity participation should be a 'number'`,
						"number.min": `Equity participation should be greater than equal 0`,
						"number.empty": `Equity participation cannot be an empty field`,
						"any.required": `Equity participation is a required field`,
					}),
					equityPercent: Joi.number().min(0).required().messages({
						"number.base": `Equity percent should be a 'number'`,
						"number.min": `Equity percent should be greater than equal 0`,
						"number.empty": `Equity percent cannot be an empty field`,
						"any.required": `Equity percent is a required field`,
					}),
					gender: Joi.string().required().allow(null).allow("").messages({
						"string.base": `Gender should be a 'string'`,
						"string.empty": `Gender cannot be an empty field`,
						"any.required": `Gender is a required field`,
					}),
					minority: Joi.string()
						.required()
						.allow("Yes", "No")
						.allow(null)
						.allow("")
						.messages({
							"string.base": `Minority should be Yes or No`,
							"string.empty": `Minority cannot be an empty field`,
							"any.required": `Minority is a required field`,
						}),
					socialStatus: Joi.string().required().allow(null).allow("").messages({
						"string.base": `Social Status should be valid value`,
						"string.empty": `Social Status cannot be an empty field`,
						"any.required": `Social Status is a required field`,
					}),
					otherSocialStatus: Joi.string().allow(null).allow("").messages({
						"string.base": `Social Status should be valid value`,
						"string.empty": `Social Status cannot be an empty field`,
					}),
					differentlyAbled: Joi.string()
						.required()
						.allow("Yes", "No")
						.allow(null)
						.allow("")
						.messages({
							"string.base": `Is differently abled should be Yes or No`,
							"string.empty": `Is differently abled cannot be an empty field`,
							"any.required": `Is differently abled is a required field`,
						}),
					acidVictim: Joi.string()
						.required()
						.allow("Yes", "No")
						.allow(null)
						.allow("")
						.messages({
							"string.base": `Is acid Victim should be Yes or No`,
							"string.empty": `Is acid Victim cannot be an empty field`,
							"any.required": `Is acid Victim is a required field`,
						}),
					email: Joi.string()
						.email({ minDomainSegments: 2, tlds: { allow: ["com", "in"] } })
						.required()
						.messages({
							"string.base": `Email should be valid value`,
							"string.empty": `Email cannot be an empty field`,
							"any.required": `Email is a required field`,
						}),
					phone: Joi.string().required().messages({
						"string.base": `Phone should be valid value`,
						"string.empty": `Phone cannot be an empty field`,
						"any.required": `Phone is a required field`,
					}),
					alternateNumber: Joi.number().required().allow(null).allow("").messages({
						"number.base": `Alternate number should be valid value`,
						"any.required": `Alternate number is a required field`,
					}),
					isAuthorised: Joi.string()
						.required()
						.allow("Yes", "No")
						.allow(null)
						.allow("")
						.messages({
							"string.base": `Is authorized should be Yes or No`,
							"string.empty": `Is authorized cannot be an empty field`,
							"any.required": `Is authorized is a required field`,
						}),
					stakeOther: Joi.string().required().allow("Yes", "No").messages({
						"string.base": `Stake in other business should be Yes or No`,
						"string.empty": `Stake in other business cannot be an empty field`,
						"any.required": `Stake in other business is a required field`,
					}),
					designation: Joi.string().required().allow(null).allow("").messages({
						"string.base": `Designation should be valid value`,
						"any.required": `Designation is a required field`,
					}),
					entrepreneur: Joi.string()
						.required()
						.allow("Yes", "No")
						.allow(null)
						.allow("")
						.messages({
							"string.base": `Is women entrepreneur should be Yes or No`,
							"string.empty": `Is women entrepreneur cannot be an empty field`,
							"any.required": `Is women entrepreneur is a required field`,
						}),
					warWidow: Joi.string()
						.required()
						.allow("Yes", "No")
						.allow(null)
						.allow("")
						.messages({
							"string.base": `Is war widow should be Yes or No`,
							"string.empty": `Is war widow cannot be an empty field`,
							"any.required": `Is war widow is a required field`,
						}),
					entity: Joi.array().required(),
				})
			)
			.required(),
	}),

	caf_one_add_employment_details_put: Joi.object({
		cafId: Joi.string().max(36).min(36).required(),
		managementMale: Joi.number().min(0).required().messages({
			"number.base": `Number of management(male) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of management(male) employee cannot be an empty field`,
			"any.required": `Number of management(male) employee is a required field`,
		}),
		managementFemale: Joi.number().min(0).required().messages({
			"number.base": `Number of management(female) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of management(female) employee cannot be an empty field`,
			"any.required": `Number of management(female) employee is a required field`,
		}),
		managementTotal: Joi.number().min(0).required().messages({
			"number.base": `Number of management(total) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of management(total) employee cannot be an empty field`,
			"any.required": `Number of management(total) employee is a required field`,
		}),
		supervisorMale: Joi.number().min(0).required().messages({
			"number.base": `Number of supervisor(male) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of supervisor(male) employee cannot be an empty field`,
			"any.required": `Number of supervisor(male) employee is a required field`,
		}),
		supervisorFemale: Joi.number().min(0).required().messages({
			"number.base": `Number of supervisor(female) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of supervisor(female) employee cannot be an empty field`,
			"any.required": `Number of supervisor(female) employee is a required field`,
		}),
		supervisorTotal: Joi.number().min(0).required().messages({
			"number.base": `Number of supervisor(total) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of supervisor(total) employee cannot be an empty field`,
			"any.required": `Number of supervisor(total) employee is a required field`,
		}),
		skilledMale: Joi.number().min(0).required().messages({
			"number.base": `Number of skilled(male) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of skilled(male) employee cannot be an empty field`,
			"any.required": `Number of skilled(male) employee is a required field`,
		}),
		skilledFemale: Joi.number().min(0).required().messages({
			"number.base": `Number of skilled(female) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of skilled(female) employee cannot be an empty field`,
			"any.required": `Number of skilled(female) employee is a required field`,
		}),
		skilledTotal: Joi.number().min(0).required().messages({
			"number.base": `Number of skilled(total) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of skilled(total) employee cannot be an empty field`,
			"any.required": `Number of skilled(total) employee is a required field`,
		}),
		unskilledMale: Joi.number().min(0).required().messages({
			"number.base": `Number of unskilled(male) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of unskilled(male) employee cannot be an empty field`,
			"any.required": `Number of unskilled(male) employee is a required field`,
		}),
		unskilledFemale: Joi.number().min(0).required().messages({
			"number.base": `Number of unskilled(female) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of unskilled(female) employee cannot be an empty field`,
			"any.required": `Number of unskilled(female) employee is a required field`,
		}),
		unskilledTotal: Joi.number().min(0).required().messages({
			"number.base": `Number of unskilled(total) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of unskilled(total) employee cannot be an empty field`,
			"any.required": `Number of unskilled(total) employee is a required field`,
		}),
		otherMale: Joi.number().min(0).required().messages({
			"number.base": `Number of other(male) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of other(male) employee cannot be an empty field`,
			"any.required": `Number of other(male) employee is a required field`,
		}),
		otherFemale: Joi.number().min(0).required().messages({
			"number.base": `Number of other(female) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of other(female) employee cannot be an empty field`,
			"any.required": `Number of other(female) employee is a required field`,
		}),
		otherTotal: Joi.number().min(0).required().messages({
			"number.base": `Number of other(total) employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of other(total) employee cannot be an empty field`,
			"any.required": `Number of other(total) employee is a required field`,
		}),
		male: Joi.number().min(0).required().messages({
			"number.base": `Number of male employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of male employee cannot be an empty field`,
			"any.required": `Number of male employee is a required field`,
		}),
		female: Joi.number().min(0).required().messages({
			"number.base": `Number of male employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of male employee cannot be an empty field`,
			"any.required": `Number of male employee is a required field`,
		}),
		total: Joi.number().min(0).required().messages({
			"number.base": `Number of male employee should be a 'number'`,
			"number.min": `Number of employee should be greater than equal 0`,
			"number.empty": `Number of male employee cannot be an empty field`,
			"any.required": `Number of male employee is a required field`,
		}),
	}),

	caf_one_get_employment_details_post: Joi.object({
		cafId: Joi.string().max(36).min(36).required(),
	}),

	caf_one_add_financial_details_put: Joi.object({
		cafId: Joi.string().max(36).min(36).required(),
		equityContribution: Joi.number().min(0).allow(null).allow("").required().messages({
			"number.base": `Equity contribution should be a 'number'`,
			"number.min": `Equity contribution should be greater than equal 0`,
			"any.required": `Equity contribution is a required field`,
		}),
		govtGrant: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Government Grant should be a 'number'`,
			"any.required": `Government Grant is a required field`,
		}),
		termLoan: Joi.number().min(0).allow(null).allow("").required().messages({
			"number.base": `Term Loan should be a 'number'`,
			"number.min": `Term Loan should be greater than equal 0`,
			"any.required": `Term Loan is a required field`,
		}),
		unsecuredLoan: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Unsecured Loan should be a 'number'`,
			"any.required": `Unsecured Loan is a required field`,
		}),
		other: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Other should be a 'number'`,
			"any.required": `Other is a required field`,
		}),
		existing: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Existing should be a 'number'`,
			"any.required": `Existing is a required field`,
		}),
		proposed: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Proposed Investment should be a 'number'`,
			"any.required": `Proposed Investment is a required field`,
		}),
		total: Joi.number().min(0).allow(null).allow("").required().messages({
			"number.base": `Total investment should be a 'number'`,
			"number.min": `Total investment should be greater than equal 0`,
			"any.required": `Total investment is a required field`,
		}),
		commecementConstruction: Joi.date().allow(null).allow("").required().messages({
			"date.base": `Commencement date should be a 'date'`,
			"any.required": `Commencement date is a required field`,
		}),
		civilConstruction: Joi.date().allow(null).allow("").required().messages({
			"date.base": `Civil Construction date should be a 'date'`,
			"any.required": `Civil Construction date is a required field`,
		}),
		trialProduction: Joi.date().allow(null).allow("").required().messages({
			"date.base": `Trial production date should be a 'date'`,
			"any.required": `Trial production date is a required field`,
		}),
		commercialProduction: Joi.date().required().messages({
			"date.base": `Commercial production date should be a 'date'`,
			"any.required": `Commercial production date is a required field`,
		}),
	}),

	caf_one_add_investment_details_put: Joi.object({
		cafId: Joi.string().max(36).min(36).required(),
		machine: Joi.array()
			.items(
				Joi.object().keys({
					machineName: Joi.string().required().messages({
						"string.base": `Machine name should be a 'string'`,
						"string.empty": `Machine name cannot be an empty field`,
						"any.required": `Machine name is a required field`,
					}),
					productionCapacity: Joi.number().min(0).required().messages({
						"number.base": `Production should be a 'number'`,
						"number.min": `Production should be greater than equal 0`,
						"number.empty": `Production cannot be an empty field`,
						"any.required": `Production is a required field`,
					}),
					unit: Joi.string().required().messages({
						"string.base": `Unit should be a 'number'`,
						"string.empty": `Unit cannot be an empty field`,
						"any.required": `Unit is a required field`,
					}),
				})
			)
			.required(),
		land: Joi.number().allow(null).min(0).allow("").required().messages({
			"number.base": `Land Value should be a 'number'`,
			"number.min": `Land Value should be greater than equal 0`,
			"number.empty": `Land Value cannot be an empty field`,
			"any.required": `Land Value is a required field`,
		}),
		landDevelopment: Joi.number().allow(null).allow("").required().messages({
			"number.base": `land development cost should be a 'number'`,
			"number.min": `land development cost should be greater than equal 0`,
			"number.empty": `land development cost cannot be an empty field`,
			"any.required": `land development cost is a required field`,
		}),
		civilWorkTech: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Civil Work Technical should be a 'number'`,
			"number.min": `Civil Work Technical should be greater than equal 0`,
			"number.empty": `Civil Work Technical cannot be an empty field`,
			"any.required": `Civil Work Technical is a required field`,
		}),
		civilWorkNontech: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Civil Work Non Technical should be a 'number'`,
			"number.min": `Civil Work Non Technical should be greater than equal 0`,
			"number.empty": `Civil Work Non Technical cannot be an empty field`,
			"any.required": `Civil Work Non Technical is a required field`,
		}),
		proposedSite: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Proposed site value should be a 'number'`,
			"number.min": `Proposed site value should be greater than equal 0`,
			"number.empty": `Proposed site value cannot be an empty field`,
			"any.required": `Proposed site value is a required field`,
		}),
		totalSite: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Total Site value should be a 'number'`,
			"number.min": `Total Site value should be greater than equal 0`,
			"number.empty": `Total Site value cannot be an empty field`,
			"any.required": `Total Site value is a required field`,
		}),
		indigenous: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Indigenous value should be a 'number'`,
			"number.min": `Indigenous value should be greater than equal 0`,
			"number.empty": `Indigenous value cannot be an empty field`,
			"any.required": `Indigenous value is a required field`,
		}),
		import: Joi.number().allow(null).allow("").required().messages({
			"number.base": `import value should be a 'number'`,
			"number.min": `import value should be greater than equal 0`,
			"number.empty": `import value cannot be an empty field`,
			"any.required": `import value is a required field`,
		}),
		proposedPlant: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Proposed Plant value should be a 'number'`,
			"number.min": `Proposed Plant value should be greater than equal 0`,
			"number.empty": `Proposed Plant value cannot be an empty field`,
			"any.required": `Proposed Plant value is a required field`,
		}),
		plantTotal: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Plant total should be a 'number'`,
			"number.min": `Plant total should be greater than equal 0`,
			"number.empty": `Plant total cannot be an empty field`,
			"any.required": `Plant total is a required field`,
		}),
		fixedAsset: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Fixed asset should be a 'number'`,
			"number.min": `Fixed asset should be greater than equal 0`,
			"number.empty": `Fixed asset cannot be an empty field`,
			"any.required": `Fixed asset is a required field`,
		}),
		furniture: Joi.number().allow(null).allow("").required().messages({
			"number.base": `furniture investment should be a 'number'`,
			"number.min": `furniture investment should be greater than equal 0`,
			"any.required": `furniture investment is a required field`,
		}),
		preOperative: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Preoperative investment should be a 'number'`,
			"number.min": `Preoperative investment should be greater than equal 0`,
			"number.empty": `Preoperative investment cannot be an empty field`,
			"any.required": `Preoperative investment is a required field`,
		}),
		interestConstruction: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Interest Construction investment should be a 'number'`,
			"number.min": `Interest Construction investment should be greater than equal 0`,
			"any.required": `nterest Construction is a required field`,
		}),
		contingencies: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Contingencies should be a 'number'`,
			"number.min": `Contingencies should be greater than equal 0`,
			"any.required": `Contingencies is a required field`,
		}),
		proposedCapital: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Proposed capital should be a 'number'`,
			"number.min": `Proposed capital should be greater than equal 0`,
			"any.required": `Proposed capital is a required field`,
		}),
		othersTotal: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Other total should be a 'number'`,
			"number.min": `Other total should be greater than equal 0`,
			"any.required": `Other total is a required field`,
		}),
		proposedOther: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Proposed Other investment should be a 'number'`,
			"number.min": `Proposed Other investment should be greater than equal 0`,
			"any.required": `Proposed Other investment is a required field`,
		}),
		grossTotal: Joi.number().allow(null).allow("").required().messages({
			"number.base": `Gross total should be a 'number'`,
			"number.min": `Gross total should be greater than equal 0`,
			"any.required": `Gross total is a required field`,
		}),
	}),

	unit_get_unit_post: Joi.object({
		generalDetailId: Joi.string().required(),
	}),

	unit__post: Joi.object({
		unitStatus: Joi.string().required(),
		generalDetailId: Joi.string().required(),
		unitName: Joi.string().max(100).required().messages({
			"string.base": `Name should be valid`,
			"string.empty": `Name cannot be an empty field`,
			"string.max": `Name should have a max length of {#limit}`,
			"any.required": `Name is a required field`,
		}),
		unitDescription: Joi.string().required().messages({
			"string.base": `Description should be valid`,
			"string.empty": `Description cannot be an empty field`,
			"any.required": `Description is a required field`,
		}),
		mainActivity: Joi.string().required().messages({
			"string.base": `Main Activity should be valid`,
			"string.empty": `Main Activity cannot be an empty field`,
			"any.required": `Main Activity is a required field`,
		}),
		unitSector: Joi.string().required().messages({
			"string.base": `Sector should be valid`,
			"string.empty": `Sector cannot be an empty field`,
			"any.required": `Sector is a required field`,
		}),
		subSector: Joi.string().required().messages({
			"string.base": `Sub sector should be valid`,
			"string.empty": `Sub sector cannot be an empty field`,
			"any.required": `Sub sector is a required field`,
		}),
		isAncillary: Joi.string().allow("Yes", "No").required(),
		locatedIn: Joi.string().required().messages({
			"string.base": `Located In should be valid`,
			"string.empty": `Located In cannot be an empty field`,
			"any.required": `Located In is a required field`,
		}),
		ownershipType: Joi.string().allow(null).allow("").messages({
			"string.base": `Owner ship type should be valid`,
		}),
		industrialEstate: Joi.string().allow(null).allow("").messages({
			"string.base": `Industrial Estate should be valid`,
		}),
		houseNumber: Joi.string().allow(null).allow("").messages({
			"string.base": `House number should be valid`,
		}),
		plotNumber: Joi.string().allow(null).allow("").messages({
			"string.base": `Plot number should be valid`,
		}),
		holdingNumber: Joi.string().allow(null).allow("").messages({
			"string.base": `Holding Number should be valid`,
		}),
		street: Joi.string().allow(null).allow("").messages({
			"string.base": `Street should be valid`,
		}),
		district: Joi.string().allow(null).allow("").messages({
			"string.base": `District should be valid`,
		}),
		block: Joi.string().allow(null).allow("").messages({
			"string.base": `Block should be valid`,
		}),
		gramPanchayat: Joi.string().allow(null).allow("").messages({
			"string.base": `Gram Panchayat should be valid`,
		}),
		city: Joi.string().allow(null).allow("").messages({
			"string.base": `City should be valid`,
		}),
		wardNo: Joi.string().allow(null).allow("").messages({
			"string.base": `Ward Number should be valid`,
		}),
		pincode: Joi.string().allow(null).allow("").messages({
			"string.base": `Pincode should be valid`,
		}),
		policeStation: Joi.string().allow(null).allow("").messages({
			"string.base": `Nearest police station should be valid`,
		}),
		nearestRailwayStation: Joi.string().allow(null).allow("").messages({
			"string.base": `Nearest railway station should be valid`,
		}),
		postOffice: Joi.string().allow(null).allow("").messages({
			"string.base": `Post office should be valid`,
		}),
		email: Joi.string().required().messages({
			"string.base": `Email should be valid`,
			"string.empty": `Email cannot be an empty field`,
			"any.required": `Email is a required field`,
		}),
		registeredPhone: Joi.string().required(),
		alternatePhone: Joi.string().allow(null).allow("").messages({
			"string.base": `Telephone number should be valid`,
		}),
		requiredLandArea: Joi.number().required().messages({
			"number.base": `Required land area should be valid`,
			"number.empty": `Required land area cannot be an empty field`,
			"any.required": `Required land area is a required field`,
		}),
		isLandAlloted: Joi.string().allow(null).allow("").messages({
			"string.base": `Is land alloted should be valid`,
		}),
	}),
	unit_update_unit_put: Joi.object({
		unitId: Joi.string().required(),
		unitStatus: Joi.string().required(),
		unitName: Joi.string().required(),
		unitDescription: Joi.string().required(),
		mainActivity: Joi.string().required(),
		unitSector: Joi.string().required(),
		subSector: Joi.string().required(),
		isAncillary: Joi.string().allow("Yes", "No").required(),
		locatedIn: Joi.string().required(),
		ownershipType: Joi.string().required(),
		industrialEstate: Joi.string().allow(null).allow(""),
		houseNumber: Joi.string().allow(null).allow(""),
		plotNumber: Joi.string().allow(null).allow(""),
		holdingNumber: Joi.string().allow(null).allow(""),
		street: Joi.string().allow(null).allow(""),
		district: Joi.string().required().allow(null).allow(""),
		block: Joi.string().required().allow(null).allow(""),
		gramPanchayat: Joi.string().allow(null).allow(""),
		city: Joi.string().required().allow(null).allow(""),
		wardNo: Joi.string().allow(null).allow(""),
		pincode: Joi.string().allow(null).allow(""),
		policeStation: Joi.string().allow(null).allow(""),
		nearestRailwayStation: Joi.string().allow(null).allow(""),
		postOffice: Joi.string().allow(null).allow(""),
		email: Joi.string().required(),
		registeredPhone: Joi.string().required(),
		alternatePhone: Joi.string().allow(null).allow(""),
		requiredLandArea: Joi.string().required(),
		isLandAlloted: Joi.string().allow(null).allow(""),
	}),

	caf_one_delete_document_details_delete: Joi.object({
		cafId: Joi.string().max(36).min(36).required(),
		documentName: Joi.string().required().messages({
			"string.base": `Document name should be valid`,
			"string.empty": `Document name cannot be an empty field`,
			"any.required": `Required land is a required field`,
		}),
	}),

	caf_one_add_product_details_put: Joi.object({
		cafId: Joi.string().max(36).min(36).required(),
		main: Joi.array()
			.items(
				Joi.object().keys({
					productName: Joi.string().required().messages({
						"string.base": `Product name name should be valid`,
						"string.empty": `Product name name cannot be an empty field`,
						"any.required": `Product name is a required field`,
					}),
					unit: Joi.string().required().messages({
						"string.base": `Unit should be valid`,
						"string.empty": `Unit cannot be an empty field`,
						"any.required": `Unit land is a required field`,
					}),
					capacity: Joi.number().required().min(0).messages({
						"number.base": `Capacity should be valid`,
						"number.min": `Capacity should be greater than or equal to 0`,
						"number.empty": `Capacity cannot be an empty field`,
						"any.required": `Capacity is a required field`,
					}),
					approxValue: Joi.number().required().messages({
						"number.base": `Approx value should be valid`,
						"number.empty": `Approx value cannot be an empty field`,
						"any.required": `Approx is a required field`,
					}),
					existingUnit: Joi.string().allow(null).allow("").messages({
						"string.base": `Existing unit name should be valid`,
						"any.required": `Approx is a required field`,
					}),
					existingCapacity: Joi.number().allow(null).messages({
						"string.base": `Capacity should be valid`,
						"any.required": `Capacity is a required field`,
					}),
					existingApproxValue: Joi.number().allow(null),
				})
			)
			.required(),
		by: Joi.array()
			.items(
				Joi.object().keys({
					productName: Joi.string().required().messages({
						"string.base": `Product name name should be valid`,
						"string.empty": `Product name name cannot be an empty field`,
						"any.required": `Product name is a required field`,
					}),
					unit: Joi.string().required().messages({
						"string.base": `Unit should be valid`,
						"string.empty": `Unit cannot be an empty field`,
						"any.required": `Unit land is a required field`,
					}),
					capacity: Joi.number().required().min(0).messages({
						"number.base": `Capacity should be valid`,
						"number.min": `Capacity should be greater than or equal to 0`,
						"number.empty": `Capacity cannot be an empty field`,
						"any.required": `Capacity is a required field`,
					}),
					approxValue: Joi.number().required().messages({
						"number.base": `Approx value should be valid`,
						"number.empty": `Approx value cannot be an empty field`,
						"any.required": `Approx is a required field`,
					}),
					existingUnit: Joi.string().allow(null).allow(""),
					existingCapacity: Joi.number().allow(null),
					existingApproxValue: Joi.number().allow(null),
				})
			)
			.required(),
		raw: Joi.array()
			.items(
				Joi.object().keys({
					productName: Joi.string().required().messages({
						"string.base": `Product name name should be valid`,
						"string.empty": `Product name name cannot be an empty field`,
						"any.required": `Product name is a required field`,
					}),
					unit: Joi.string().required().messages({
						"string.base": `Unit should be valid`,
						"string.empty": `Unit cannot be an empty field`,
						"any.required": `Unit land is a required field`,
					}),
					capacity: Joi.number().required().min(0).messages({
						"number.base": `Capacity should be valid`,
						"number.min": `Capacity should be greater than or equal to 0`,
						"number.empty": `Capacity cannot be an empty field`,
						"any.required": `Capacity is a required field`,
					}),
					approxValue: Joi.number().required().messages({
						"number.base": `Approx value should be valid`,
						"number.empty": `Approx value cannot be an empty field`,
						"any.required": `Approx is a required field`,
					}),
					existingUnit: Joi.string().allow(null).allow(""),
					existingCapacity: Joi.number().allow(null),
					existingApproxValue: Joi.number().allow(null),
				})
			)
			.required(),
		process: Joi.array()
			.items(
				Joi.object().keys({
					chemicalName: Joi.string().required().messages({
						"string.base": `Chemical Name should be valid string`,
						"string.empty": `Chemical Name cannot be an empty field`,
						"any.required": `Chemical Name land is a required field`,
					}),
					unit: Joi.string().required().messages({
						"string.base": `Unit should be valid string`,
						"string.empty": `Unit cannot be an empty field`,
						"any.required": `Unit land is a required field`,
					}),
					qty: Joi.number().required().min(0).messages({
						"number.base": `Quantity should be valid number`,
						"number.empty": `Quantity cannot be an empty field`,
						"any.required": `Quantity land is a required field`,
					}),
					annualValue: Joi.number().min(0).required().messages({
						"number.base": `Annual Value should be valid`,
						"number.empty": `Annual Value cannot be an empty field`,
						"any.required": `Annual Value land is a required field`,
					}),
					existingUnit: Joi.string().allow(null).allow(""),
					existingQty: Joi.number().allow(null),
					existingAnnualValue: Joi.number().allow(null),
				})
			)
			.required(),
	}),

	verify_otp_post: Joi.object({
		investorId: Joi.string().max(36).min(36).required(),
		cafId: Joi.string().max(36).min(36).required(),
		otp: Joi.number().max(999999).required(),
		type: Joi.string().required(),
	}),
};

/**
 *
 * The validator middleware checks for the request body in each APIs.
 *
 * For each API a key is created which is checked from the @schemas variable.
 * If the key matches all the request body is checked. If the request body is not found 400 error code
 * is thrown. If there are no matching keys the next middleware is called.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express next middleware function
 * @returns
 */

const validator = (req, res, next) => {
	console.log(req.path);
	try {
		const key = `${req.path
			.split("/")
			.splice(2)
			.join("_")
			.split("-")
			.join("_")}_${req.method.toLowerCase()}`;

		const schema = schemas[key];
		console.log({ key: key });
		if (schema === undefined) {
			return next();
		} else {
			const { value, error } = schema.validate(req.body);
			if (error) throw new ErrorHandler(BAD_GATEWAY, error.message);
			else next();
		}
	} catch (error) {
		next(error);
	}
};

module.exports = validator;
